import { NextRequest, NextResponse } from "next/server";
import {
  AccessToken,
  RoomServiceClient,
} from "livekit-server-sdk";

export async function POST(request: NextRequest) {
  try {
    const { roomName, participantName } =
      await request.json();

    if (!roomName || !participantName) {
      return NextResponse.json(
        {
          error:
            "Sala e nome são obrigatórios.",
        },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.LIVEKIT_API_KEY;

    const apiSecret =
      process.env.LIVEKIT_API_SECRET;

    const serverUrl =
      process.env.LIVEKIT_URL;

    if (
      !apiKey ||
      !apiSecret ||
      !serverUrl
    ) {
      return NextResponse.json(
        {
          error:
            "LiveKit não configurado.",
        },
        { status: 500 }
      );
    }

    /*
      RoomService usa HTTPS,
      enquanto nossa variável normalmente
      está salva como wss://
    */

    const httpUrl =
      serverUrl.replace(
        /^wss:/,
        "https:"
      );

    const roomService =
      new RoomServiceClient(
        httpUrl,
        apiKey,
        apiSecret
      );

    /*
      Verifica quantas pessoas
      já estão na sala.
    */

    let participants = [];

    try {
      participants =
        await roomService.listParticipants(
          roomName
        );
    } catch {
      /*
        Se a sala ainda não existe,
        ela simplesmente está vazia.
      */
      participants = [];
    }

    if (participants.length >= 10) {
      return NextResponse.json(
        {
          error:
            "Esta sala já está cheia. Limite de 10 participantes.",
        },
        { status: 403 }
      );
    }

    const token =
      new AccessToken(
        apiKey,
        apiSecret,
        {
          identity: `${participantName}-${crypto.randomUUID()}`,
          name: participantName,
        }
      );

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    return NextResponse.json({
      token: await token.toJwt(),
      serverUrl,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Erro ao gerar token.",
      },
      { status: 500 }
    );
  }
}