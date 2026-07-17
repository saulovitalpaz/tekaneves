import { NextResponse } from "next/server";

export function apiData<T>(data: T, status = 200) {
  return NextResponse.json({ data, error: null }, { status });
}

export function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ data: null, error: { code, message } }, { status });
}
