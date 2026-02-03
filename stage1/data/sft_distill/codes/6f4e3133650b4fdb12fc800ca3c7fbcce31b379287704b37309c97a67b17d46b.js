class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentState = 'idle';
    this.stateChangeCount = 0; // 可验证的状态信号
  }

  preload() {
    // 创建青色角色的 idle 纹理（圆形身体 + 小眼睛）
    const idleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    idleGraphics.fillStyle(0x00FFFF, 1); // 青色
    idleGraphics.fillCircle(32, 32, 28);
    // 眼睛
    idleGraphics.fillStyle(0x000000, 1);
    idleGraphics.fillCircle(22, 26, 4);
    idleGraphics.fillCircle(42, 26, 4);
    idleGraphics.generateTexture('idle', 64, 64);
    idleGraphics.destroy();

    // 创建青色角色的 run 纹理（椭圆身体 + 大眼睛，表示运动）
    const runGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    runGraphics.fillStyle(0x00FFFF, 1);
    runGraphics.fillEllipse(32, 32, 56, 50);
    // 更大的眼睛表示兴奋
    runGraphics.fillStyle(0x000000, 1);
    runGraphics.fillCircle(20, 26, 6);
    runGraphics.fillCircle(44, 26, 6);
    // 嘴巴（运动时张开）
    runGraphics.fillStyle(0xFF0000, 1);
    runGraphics.fillEllipse(32, 40, 16, 8);
    runGraphics.generateTexture('run', 64, 64);
    runGraphics.destroy();
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建角色
    this.player = this.add.sprite(400, 300, 'idle');
    this.player.setScale(2);

    // 创建帧动画 - idle 状态（在 idle 和稍微缩放的 idle 之间切换）
    this.anims.create({
      key: 'idle_anim',
      frames: [
        { key: 'idle', frame: 0 },
        { key: 'idle', frame: 0 }
      ],
      frameRate: 2,
      repeat: -1
    });

    // 创建帧动画 - run 状态（在 run 纹理间快速切换）
    this.anims.create({
      key: 'run_anim',
      frames: [
        { key: 'run', frame: 0 },
        { key: 'idle', frame: 0 },
        { key: 'run', frame: 0 }
      ],
      frameRate: 8,
      repeat: -1
    });

    // 初始播放 idle 动画
    this.player.play('idle_anim');

    // 创建 idle 状态的呼吸 tween
    this.idleTween = this.tweens.add({
      targets: this.player,
      scaleX: 2.1,
      scaleY: 2.1,
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      paused: false
    });

    // 创建 run 状态的抖动 tween（初始暂停）
    this.runTween = this.tweens.add({
      targets: this.player,
      x: '+=10',
      duration: 100,
      ease: 'Linear',
      yoyo: true,
      repeat: -1,
      paused: true
    });

    // 状态显示文本
    this.stateText = this.add.text(400, 100, 'State: IDLE', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#00FFFF',
      fontStyle: 'bold'
    });
    this.stateText.setOrigin(0.5);

    // 状态切换计数显示
    this.countText = this.add.text(400, 150, 'State Changes: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    });
    this.countText.setOrigin(0.5);

    // 提示文本
    this.instructionText = this.add.text(400, 500, 'Press SPACE to RUN | Press any other key to IDLE', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#AAAAAA'
    });
    this.instructionText.setOrigin(0.5);

    // 键盘输入监听
    this.input.keyboard.on('keydown', (event) => {
      if (event.code === 'Space') {
        this.switchState('run');
      } else {
        this.switchState('idle');
      }
    });

    // 添加鼠标点击切换（点击角色切换状态）
    this.player.setInteractive();
    this.player.on('pointerdown', () => {
      if (this.currentState === 'idle') {
        this.switchState('run');
      } else {
        this.switchState('idle');
      }
    });
  }

  switchState(newState) {
    if (this.currentState === newState) {
      return; // 状态未改变
    }

    this.currentState = newState;
    this.stateChangeCount++;

    // 更新显示
    this.stateText.setText(`State: ${newState.toUpperCase()}`);
    this.countText.setText(`State Changes: ${this.stateChangeCount}`);

    if (newState === 'idle') {
      // 切换到 idle 状态
      this.player.play('idle_anim');
      this.player.setTexture('idle');
      
      // 停止 run tween，启动 idle tween
      this.runTween.pause();
      this.player.x = 400; // 重置位置
      this.idleTween.resume();

      // 状态切换闪烁效果
      this.tweens.add({
        targets: this.player,
        alpha: 0.5,
        duration: 100,
        yoyo: true,
        repeat: 2
      });

    } else if (newState === 'run') {
      // 切换到 run 状态
      this.player.play('run_anim');
      this.player.setTexture('run');
      
      // 停止 idle tween，启动 run tween
      this.idleTween.pause();
      this.player.setScale(2); // 重置缩放
      this.runTween.resume();

      // 状态切换闪烁效果
      this.tweens.add({
        targets: this.player,
        alpha: 0.3,
        duration: 80,
        yoyo: true,
        repeat: 3
      });

      // 添加旋转效果表示兴奋
      this.tweens.add({
        targets: this.player,
        angle: 360,
        duration: 500,
        ease: 'Back.easeOut'
      });
    }
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 例如：根据状态改变背景色
    if (this.currentState === 'run') {
      // run 状态下背景稍微亮一点
      this.stateText.setColor('#00FFFF');
    } else {
      this.stateText.setColor('#00CCCC');
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: GameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);