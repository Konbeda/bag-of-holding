export type ZipCodeAddress = {
  street: string;
  district: string;
  city: string;
  state: string;
};

export async function lookupZipCode(zipCode: string): Promise<ZipCodeAddress | null> {
  const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);

  if (!response.ok) throw new Error('ViaCEP request failed');

  const body = await response.json();

  return body.erro
    ? null
    : { street: body.logradouro, district: body.bairro, city: body.localidade, state: body.uf };
}
