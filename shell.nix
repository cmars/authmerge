{ pkgs ? import <nixpkgs> { } }:
pkgs.mkShell {
  buildInputs = with pkgs.buildPackages; [
    nodejs
    open-policy-agent
  ];

  shellHook = ''
    export PATH=$(npm bin):$PATH
  '';
}

