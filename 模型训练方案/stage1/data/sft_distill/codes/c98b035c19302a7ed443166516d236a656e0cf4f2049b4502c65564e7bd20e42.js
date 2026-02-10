class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentState = 'idle';
    this.stateChangeCount = 0;
  }

  preload() {
    // 程序化生成角色纹理
    this.generateCharacterTextures();
  }

  generateCharacterTextures() {
    // 生成 idle 状态纹理（2帧呼吸动画）
    for (let i = 0; i < 2; i++) {
      const graphics = this.add.graphics();
      const scale = 1 + i * 0.1; // 呼吸效果
      
      // 身体
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRoundedRect(20 - 15 * scale, 10 - 20 * scale, 30 * scale, 40 * scale, 5);
      
      // 头部
      graphics.fillCircle(20, 5 - 20 * scale, 12 * scale);
      
      // 眼睛
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(15, 0 - 20 * scale, 2);
      graphics.fillCircle(25, 0 - 20 * scale, 2);
      
      graphics.generateTexture(`idle_${i}`, 50, 60);
      graphics.destroy();
    }

    // 生成 run 状态纹理（4帧跑步动画）
    for (let i = 0; i < 4; i++) {
      const graphics = this.add.graphics();
      const legOffset = Math.sin(i * Math.PI / 2) * 8;
      
      // 身体（稍微前倾）
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRoundedRect(15, 10, 30, 35, 5);
      
      // 头部
      graphics.fillCircle(20, 5, 12);
      
      // 眼睛
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(15, 0, 2);
      graphics.fillCircle(25, 0, 2);
      
      // 手臂（前后摆动）
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRect(10 + legOffset / 2, 20, 5, 15);
      graphics.fillRect(35 - legOffset / 2, 20, 5, 15);
      
      // 腿部（跑步动作）
      graphics.fillRect(18 + legOffset, 45, 6, 12);
      graphics.fillRect(26 - legOffset, 45, 6, 12);
      
      graphics.generateTexture(`run_${i}`, 50, 60);
      graphics.destroy();
    }
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2d2d2d, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建地面
    const ground = this.add.graphics();
    ground.fillStyle(0x444444, 1);
    ground.fillRect(0, 500, 800, 100);

    // 创建角色精灵
    this.player = this.add.sprite(400, 450, 'idle_0');
    this.player.setScale(2);

    // 创建 idle 动画
    this.anims.create({
      key: 'idle',
      frames: [
        { key: 'idle_0' },
        { key: 'idle_1' },
        { key: 'idle_0' }
      ],
      frameRate: 2,
      repeat: -1
    });

    // 创建 run 动画
    this.anims.create({
      key: 'run',
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
    this.player.play('idle');

    // 创建状态显示文本
    this.stateText = this.add.text(20, 20, 'State: IDLE', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建状态切换计数器
    this.counterText = this.add.text(20, 70, 'State Changes: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建操作提示
    this.add.text(20, 550, 'Press SPACE for IDLE | Press ENTER for RUN', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    });

    // 键盘输入监听
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // 监听按键事件
    this.spaceKey.on('down', () => {
      this.changeState('idle');
    });

    this.enterKey.on('down', () => {
      this.changeState('run');
    });

    // 添加额外的键盘监听（I 键 = idle, R 键 = run）
    this.input.keyboard.on('keydown-I', () => {
      this.changeState('idle');
    });

    this.input.keyboard.on('keydown-R', () => {
      this.changeState('run');
    });
  }

  changeState(newState) {
    // 如果状态相同，不做处理
    if (this.currentState === newState) {
      return;
    }

    // 停止当前所有 tween
    this.tweens.killTweensOf(this.player);

    this.currentState = newState;
    this.stateChangeCount++;

    // 更新文本
    this.stateText.setText(`State: ${newState.toUpperCase()}`);
    this.counterText.setText(`State Changes: ${this.stateChangeCount}`);

    if (newState === 'idle') {
      // 切换到 idle 状态
      this.player.play('idle');

      // Tween: 缩放动画 + 回到中心位置
      this.tweens.add({
        targets: this.player,
        scaleX: 2,
        scaleY: 2,
        x: 400,
        duration: 300,
        ease: 'Back.easeOut'
      });

      // 添加轻微的上下浮动效果
      this.tweens.add({
        targets: this.player,
        y: 445,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

    } else if (newState === 'run') {
      // 切换到 run 状态
      this.player.play('run');

      // Tween: 放大 + 左右移动循环
      this.tweens.add({
        targets: this.player,
        scaleX: 2.5,
        scaleY: 2.5,
        duration: 200,
        ease: 'Power2'
      });

      // 左右跑动动画
      this.tweens.add({
        targets: this.player,
        x: 600,
        y: 450,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Linear',
        onYoyo: () => {
          this.player.setFlipX(true);
        },
        onRepeat: () => {
          this.player.setFlipX(false);
        }
      });
    }
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  pixelArt: true
};

new Phaser.Game(config);