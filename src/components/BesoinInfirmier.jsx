import React, { useEffect, useState, useCallback } from 'react';

const BesoinInfirmier = () => {





    return (

        /**
         * L'idée est de mettre le bon nombre de td (correspondant aux jours dans le mois en question); et ensuite de les fill avec la bonne stat.
         * Le Header étant déjà réalisé, la partie code est à continuer.
         */
        <>
        <table className="tablemaker">
            <thead className='theadmaker'>
                <tr>
                    <th colSpan="100%">
                        <h3 className='tablemaker-title'>Besoins Infirmiers</h3>
                    </th>
                </tr>
            </thead>
            <tbody className="">
                <tr>
                    <td>Journée</td>
                </tr>
                <tr>
                    <td>Soir</td>
                </tr>
                <tr>
                    <td>Matin</td>
                </tr>
            </tbody>
        </table>
        </>
    )
}

export default BesoinInfirmier;