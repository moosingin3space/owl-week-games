let
  sources = import ./nix/sources.nix;
  pkgs = import sources.nixpkgs {};
  owlmaker = pkgs.callPackage sources.owlmaker {};
in
pkgs.mkShell {
  buildInputs = [
    pkgs.wrangler
    pkgs.nodejs-14_x
  ];
}
