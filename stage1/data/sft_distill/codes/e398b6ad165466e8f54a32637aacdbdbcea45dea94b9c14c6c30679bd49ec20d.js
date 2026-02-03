class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentState = 'idle'; // 可验证的状态信号
    this.stateChangeCount = 0; // 状态切换次数
  }

  preload() {
    // 生成 idle 状态的帧纹理（3帧，粉色方块，大小变化）
    for (let i = 0; i < 3; i++) {
      const graphics = this.add.graphics();
      const size = 60 + i * 5; // 大小从60到70渐变
      const offsetX = (70 - size) / 2;
      const offsetY = (70 - size) / 2;
      
      // 绘制粉色身体
      graphics.fillStyle(0xff69b4, 1);
      graphics.fillRoundedRect(offsetX, offsetY, size, size, 10);
      
      // 绘制眼睛
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(offsetX + size * 0.35, offsetY + size * 0.4, 4);
      graphics.fillCircle(offsetX + size * 0.65, offsetY + size * 0.4, 4);
      
      // 绘制笑脸
      graphics.lineStyle(2, 0x000000, 1);
      graphics.beginPath();
      graphics.arc(offsetX + size * 0.5, offsetY + size * 0.6, size * 0.2, 0, Math.PI, false);
      graphics.strokePath();
      
      graphics.generateTexture(`idle_${i}`, 70, 70);
      graphics.destroy();
    }

    // 生成 run 状态的帧纹理（4帧，倾斜姿态）
    for (let i = 0; i < 4; i++) {
      const graphics = this.add.graphics();
      const angle = (i % 2 === 0) ? -10 : 10; // 左右倾斜
      
      // 保存变换状态
      graphics.save();
      graphics.translateCanvas(35, 35);
      graphics.rotateCanvas(Phaser.Math.DegToRad(angle));
      graphics.translateCanvas(-35, -35);
      
      // 绘制粉色身体（拉长形状表示奔跑）
      graphics.fillStyle(0xff69b4, 1);
      graphics.fillRoundedRect(10, 15, 50, 40, 8);
      
      // 绘制眼睛（更有活力的表情）
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(27, 30, 4);
      graphics.fillCircle(43, 30, 4);
      
      // 绘制兴奋的笑脸
      graphics.lineStyle(3, 0x000000, 1);
      graphics.beginPath();
      graphics.arc(35, 40, 10, 0, Math.PI, false);
      graphics.strokePath();
      
      // 绘制运动线条
      graphics.lineStyle(2, 0xffa0d0, 0.6);
      graphics.lineBetween(5, 25 + i * 3, 15, 25 + i * 3);
      graphics.lineBetween(5, 35 + i * 3, 15, 35 + i * 3);
      
      graphics.restore();
      graphics.generateTexture(`run_${i}`, 70, 70);
      graphics.destroy();
    }
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x87ceeb, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建地面
    const ground = this.add.graphics();
    ground.fillStyle(0x90ee90, 1);
    ground.fillRect(0, 500, 800, 100);

    // 创建角色精灵
    this.player = this.add.sprite(400, 450, 'idle_0');
    this.player.setScale(2);

    // 创建 idle 动画
    this.anims.create({
      key: 'idle_anim',
      frames: [
        { key: 'idle_0' },
        { key: 'idle_1' },
        { key: 'idle_2' },
        { key: 'idle_1' }
      ],
      frameRate: 4,
      repeat: -1
    });

    // 创建 run 动画
    this.anims.create({
      key: 'run_anim',
      frames: [
        { key: 'run_0' },
        { key: 'run_1' },
        { key: 'run_2' },
        { key: 'run_3' }
      ],
      frameRate: 8,
      repeat: -1
    });

    // 播放初始 idle 动画
    this.player.play('idle_anim');

    // 创建 idle 状态的浮动 tween
    this.idleTween = this.tweens.add({
      targets: this.player,
      y: 440,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // 创建状态显示文本
    this.stateText = this.add.text(400, 50, 'State: IDLE', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ff69b4',
      stroke: '#ffffff',
      strokeThickness: 4
    });
    this.stateText.setOrigin(0.5);

    // 创建计数器文本
    this.counterText = this.add.text(400, 100, 'State Changes: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.counterText.setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 550, 'Press SPACE to toggle | Arrow Keys to RUN', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 空格键切换状态
    this.spaceKey.on('down', () => {
      this.toggleState();
    });
  }

  update() {
    // 方向键触发 run 状态
    if (this.cursors.left.isDown || this.cursors.right.isDown || 
        this.cursors.up.isDown || this.cursors.down.isDown) {
      if (this.currentState !== 'run') {
        this.setState('run');
      }
    }
  }

  toggleState() {
    if (this.currentState === 'idle') {
      this.setState('run');
    } else {
      this.setState('idle');
    }
  }

  setState(newState) {
    if (this.currentState === newState) return;

    this.currentState = newState;
    this.stateChangeCount++;
    this.counterText.setText(`State Changes: ${this.stateChangeCount}`);

    // 停止所有 tweens
    this.tweens.killTweensOf(this.player);

    if (newState === 'idle') {
      // 切换到 idle 动画
      this.player.play('idle_anim');
      this.stateText.setText('State: IDLE');
      this.stateText.setColor('#ff69b4');

      // 重置位置并启动浮动 tween
      this.player.y = 450;
      this.tweens.add({
        targets: this.player,
        y: 440,
        duration: 1000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });

    } else if (newState === 'run') {
      // 切换到 run 动画
      this.player.play('run_anim');
      this.stateText.setText('State: RUN');
      this.stateText.setColor('#ff0000');

      // 重置位置并启动水平抖动 tween
      this.player.y = 450;
      this.tweens.add({
        targets: this.player,
        x: this.player.x + 10,
        duration: 100,
        ease: 'Linear',
        yoyo: true,
        repeat: -1
      });

      // 添加轻微的上下跳动
      this.tweens.add({
        targets: this.player,
        y: 445,
        duration: 200,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
  scene: GameScene,
  pixelArt: false,
  antialias: true
};

new Phaser.Game(config);