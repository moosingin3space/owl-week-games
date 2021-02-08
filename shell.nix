let
  sources = import ./nix/sources.nix;
  pkgs = import sources.nixpkgs {};
  owlmaker = pkgs.callPackage sources.owlmaker {};
in
pkgs.mkShell {
  buildInputs = [
    owlmaker
    pkgs.wrangler
  ];
}
