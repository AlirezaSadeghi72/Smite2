#!/usr/bin/env bash
set -e

CORES_DIR="$(cd "$(dirname "$0")/.." && pwd)/cores"
mkdir -p "$CORES_DIR"

ARCH_RAW="$(uname -m)"
case "$ARCH_RAW" in
  x86_64|amd64) ARCH="amd64"; RATHOLE_ARCH="x86_64" ;;
  aarch64|arm64) ARCH="arm64"; RATHOLE_ARCH="aarch64" ;;
  *) ARCH="amd64"; RATHOLE_ARCH="x86_64" ;;
esac

echo "[Smite] Downloading Core Binaries into $CORES_DIR (Arch: $ARCH)..."

# 1. Backhaul v0.7.2
if [ ! -f "$CORES_DIR/backhaul" ]; then
  echo " -> Downloading Backhaul v0.7.2..."
  TMP_DIR="$(mktemp -d)"
  curl -fsSL "https://github.com/Musixal/Backhaul/releases/download/v0.7.2/backhaul_linux_${ARCH}.tar.gz" -o "$TMP_DIR/backhaul.tar.gz"
  tar -xzf "$TMP_DIR/backhaul.tar.gz" -C "$TMP_DIR"
  BIN="$(find "$TMP_DIR" -type f -name 'backhaul' | head -n1)"
  cp "$BIN" "$CORES_DIR/backhaul"
  chmod +x "$CORES_DIR/backhaul"
  rm -rf "$TMP_DIR"
fi

# 2. Rathole v0.5.0
if [ ! -f "$CORES_DIR/rathole" ]; then
  echo " -> Downloading Rathole v0.5.0..."
  TMP_DIR="$(mktemp -d)"
  curl -fsSL "https://github.com/rapiz1/rathole/releases/download/v0.5.0/rathole-${RATHOLE_ARCH}-unknown-linux-gnu.zip" -o "$TMP_DIR/rathole.zip"
  unzip -q "$TMP_DIR/rathole.zip" -d "$TMP_DIR"
  BIN="$(find "$TMP_DIR" -type f -name 'rathole' | head -n1)"
  cp "$BIN" "$CORES_DIR/rathole"
  chmod +x "$CORES_DIR/rathole"
  rm -rf "$TMP_DIR"
fi

# 3. GOST v2.12.0
if [ ! -f "$CORES_DIR/gost" ]; then
  echo " -> Downloading GOST v2.12.0..."
  TMP_DIR="$(mktemp -d)"
  curl -fsSL "https://github.com/ginuerzh/gost/releases/download/v2.12.0/gost_2.12.0_linux_${ARCH}.tar.gz" -o "$TMP_DIR/gost.tar.gz"
  tar -xzf "$TMP_DIR/gost.tar.gz" -C "$TMP_DIR"
  BIN="$(find "$TMP_DIR" -type f -name 'gost' | head -n1)"
  cp "$BIN" "$CORES_DIR/gost"
  chmod +x "$CORES_DIR/gost"
  rm -rf "$TMP_DIR"
fi

# 4. Chisel v1.11.3
if [ ! -f "$CORES_DIR/chisel" ]; then
  echo " -> Downloading Chisel v1.11.3..."
  TMP_DIR="$(mktemp -d)"
  curl -fsSL "https://github.com/jpillora/chisel/releases/download/v1.11.3/chisel_1.11.3_linux_${ARCH}.gz" -o "$TMP_DIR/chisel.gz"
  gunzip "$TMP_DIR/chisel.gz"
  cp "$TMP_DIR/chisel" "$CORES_DIR/chisel"
  chmod +x "$CORES_DIR/chisel"
  rm -rf "$TMP_DIR"
fi

# 5. FRP v0.65.0 (frps & frpc)
if [ ! -f "$CORES_DIR/frps" ] || [ ! -f "$CORES_DIR/frpc" ]; then
  echo " -> Downloading FRP v0.65.0..."
  TMP_DIR="$(mktemp -d)"
  curl -fsSL "https://github.com/fatedier/frp/releases/download/v0.65.0/frp_0.65.0_linux_${ARCH}.tar.gz" -o "$TMP_DIR/frp.tar.gz"
  tar -xzf "$TMP_DIR/frp.tar.gz" -C "$TMP_DIR"
  FRPS_BIN="$(find "$TMP_DIR" -type f -name 'frps' | head -n1)"
  FRPC_BIN="$(find "$TMP_DIR" -type f -name 'frpc' | head -n1)"
  cp "$FRPS_BIN" "$CORES_DIR/frps"
  cp "$FRPC_BIN" "$CORES_DIR/frpc"
  chmod +x "$CORES_DIR/frps" "$CORES_DIR/frpc"
  rm -rf "$TMP_DIR"
fi

echo "[Smite] All core binaries installed in $CORES_DIR:"
ls -lh "$CORES_DIR"
