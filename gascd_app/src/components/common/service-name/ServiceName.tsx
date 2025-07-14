import React from 'react';
import { Session } from 'next-auth';
import LogoutButton from '../buttons/logoutButton';
import Link from 'next/link';

type Props = {
    session?: Session | null;
};

const ServiceName: React.FC<Props> = ({ session }) => {
    return (
        <section aria-label="Service information" className="govuk-service-navigation"
            data-module="govuk-service-navigation">
            <div className="govuk-width-container">
                <div className="govuk-service-navigation__container">
                    <span className="govuk-service-navigation__service-name">
                        <Link href="/" className="govuk-service-navigation__link">
                            Get adult social care data
                        </Link>
                    </span>
                    {!session ? (
                        <>&nbsp;</>
                    ) : (
                        <nav aria-label="Menu" className="govuk-service-navigation__wrapper">
                            <ul className="govuk-service-navigation__list" id="navigation">
                                <li className="govuk-service-navigation__item app-sign-out" data-module="edge"
                                    style={{ marginLeft: "auto", padding: "10px 0px" }}>
                                    <LogoutButton />
                                </li>
                            </ul>
                        </nav>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ServiceName;
