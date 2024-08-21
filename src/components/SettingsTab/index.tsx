import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/pro-light-svg-icons/faXmark";
import { default as cx } from "classnames";
import React, { forwardRef } from "react";
import { TransitionStatus } from "react-transition-group";
import * as styles from "./SettingsTab.module.scss";
import { TRANSITION_DURATION } from "../../constants";

interface SettingsTabProps {
  setSettingsTabHandler: (show: boolean) => void;
  transitionStatus: TransitionStatus;
}

const SettingsTab = forwardRef(
  (props: SettingsTabProps, ref: React.ForwardedRef<HTMLDivElement>) => {
    const toggleableUiStyles: React.CSSProperties = {
      transitionDuration: TRANSITION_DURATION / 1000 + "s",
    };

    const closeButtonHandler = () => props.setSettingsTabHandler(false);

    const classes = cx(styles["settings-tab"], props.transitionStatus);

    return (
      <div
        className={classes}
        onClick={closeButtonHandler}
        data-testid="SettingsTab"
        ref={ref}
        style={toggleableUiStyles}
      >
        <div className={styles["settings-tab--body"]}>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
            suscipit augue id quam elementum cursus. Proin et pulvinar felis.
            Sed sit amet nisi at magna accumsan viverra. Pellentesque congue id
            libero ut pharetra. Nam facilisis luctus mi sit amet fermentum.
            Etiam id tincidunt eros. Etiam dapibus massa sit amet ullamcorper
            sodales. Aliquam nec lectus ultricies, vehicula purus eu, venenatis
            lacus. Morbi luctus sed sapien quis volutpat. Quisque diam leo,
            scelerisque eu ante nec, lacinia ultricies nunc. Quisque efficitur
            risus non ligula placerat sollicitudin.
          </p>

          <p>
            Aliquam pulvinar bibendum magna, ac blandit lacus egestas sit amet.
            Nam et tellus et neque pharetra ultrices a quis augue. Duis eu
            libero fermentum, interdum arcu et, blandit est. Nullam ligula orci,
            euismod sed auctor vulputate, tempus in odio. Aliquam vitae aliquet
            mi. Nulla quis mi a sapien consectetur commodo a vel lorem. Integer
            feugiat enim at arcu dapibus tincidunt. Ut ut dapibus odio, a
            venenatis mauris.
          </p>

          <p>
            Maecenas aliquam arcu eu mollis pellentesque. Vivamus neque eros,
            sagittis vitae lectus et, elementum tempor turpis. Pellentesque
            habitant morbi tristique senectus et netus et malesuada fames ac
            turpis egestas. Nulla egestas nec justo eu interdum. Suspendisse
            quis felis nec mi luctus porttitor sit amet sed mauris. Orci varius
            natoque penatibus et magnis dis parturient montes, nascetur
            ridiculus mus. Vestibulum blandit enim sit amet ante feugiat
            vestibulum. Fusce sagittis erat arcu, a iaculis ante bibendum sit
            amet. Etiam tristique gravida diam, quis tincidunt est ullamcorper
            sed. Maecenas leo risus, egestas in nunc vel, sodales dignissim leo.
          </p>

          <p>
            Donec consequat ultricies eros, vitae efficitur mauris porta sed.
            Nam porta arcu vitae egestas viverra. Vivamus cursus vel ante at
            vestibulum. Integer bibendum metus at nibh laoreet eleifend vel ut
            ante. Pellentesque posuere, felis sed dapibus volutpat, sapien
            tellus rutrum tellus, non tempor velit magna eget lorem. Vestibulum
            consequat diam in tellus malesuada volutpat. Sed a dui purus. Cras
            ultrices, massa in porttitor iaculis, velit justo cursus orci, sit
            amet tempus nisl turpis vitae metus. Pellentesque a maximus odio.
            Integer luctus nibh velit, in dictum est varius in. Phasellus eu
            nulla ligula. Praesent molestie vitae justo sit amet scelerisque.
            Nullam gravida, massa eget tincidunt pharetra, turpis enim ultricies
            justo, quis rhoncus arcu diam vitae sem. Etiam tincidunt ex enim,
            vel rhoncus urna varius id. Nullam in risus dui. Etiam vulputate
            accumsan urna, eu ullamcorper erat tristique eget.
          </p>

          <p>
            Integer sed gravida dolor. Nullam ultricies arcu quis est vestibulum
            faucibus. Aenean consequat nisl vel erat suscipit euismod. Nulla
            ante lacus, efficitur nec condimentum et, molestie vel libero.
            Praesent leo magna, accumsan tempor elit eget, finibus condimentum
            est. Nunc rhoncus hendrerit sagittis. Integer suscipit tellus et
            eros scelerisque tincidunt. Ut sit amet turpis vel massa rhoncus
            malesuada.
          </p>
        </div>
        <div className={styles["settings-tab--footer"]}>
          <h2>Settings</h2>
          <button data-testid="SettingsTab--closeButton" type="button">
            <FontAwesomeIcon icon={faXmark} />
            <span className={styles["visually-hidden"]}>Close settings</span>
          </button>
        </div>
      </div>
    );
  }
);

export default SettingsTab;
