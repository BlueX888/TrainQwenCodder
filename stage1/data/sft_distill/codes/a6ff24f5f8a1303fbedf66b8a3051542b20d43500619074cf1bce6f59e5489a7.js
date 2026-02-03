class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentState = 'idle'; // 状态信号：idle 或 run
    this.stateChangeCount = 0; // 状态切换计数器（可验证信号）
  }

  preload() {
    // 程序化生成角色纹理
    this.generateCharacterTextures();
  }

  create() {
    // 创建紫色角色精灵
    this.player = this.add.sprite(400, 300, 'idle_0');
    this.player.setScale(2);

    // 创建 idle 动画（4 帧，慢速循环）
    this.anims.create({
      key: 'idle',
      frames: [
        { key: 'idle_0' },
        { key: 'idle_1' },
        { key: 'idle_2' },
        { key: 'idle_3' }
      ],
      frameRate: 4,
      repeat: -1
    });

    // 创建 run 动画（4 帧，快速循环）
    this.anims.create({
      key: 'run',
      frames: [
        { key: 'run_0' },
        { key: 'run_1' },
        { key: 'run_2' },
        { key: 'run_3' }
      ],
      frameRate: 10,
      repeat: -1
    });

    // 播放初始动画
    this.player.play('idle');

    // 创建状态显示文本
    this.stateText = this.add.text(400, 100, 'State: IDLE', {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.stateText.setOrigin(0.5);

    // 创建计数器文本
    this.counterText = this.add.text(400, 150, 'State Changes: 0', {
      fontSize: '24px',
      fill: '#ffff00'
    });
    this.counterText.setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 500, 'Press SPACE to toggle IDLE/RUN\nPress ARROW KEYS to RUN', {
      fontSize: '20px',
      fill: '#aaaaaa',
      align: 'center'
    }).setOrigin(0.5);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 空格键切换状态
    this.spaceKey.on('down', () => {
      if (this.currentState === 'idle') {
        this.switchToRun();
      } else {
        this.switchToIdle();
      }
    });

    // 用于 tween 的引用
    this.runTween = null;
  }

  update() {
    // 方向键触发 run 状态
    if (this.cursors.left.isDown || this.cursors.right.isDown || 
        this.cursors.up.isDown || this.cursors.down.isDown) {
      if (this.currentState === 'idle') {
        this.switchToRun();
      }
      
      // 根据方向移动角色
      if (this.cursors.left.isDown) {
        this.player.x -= 3;
        this.player.setFlipX(true);
      }
      if (this.cursors.right.isDown) {
        this.player.x += 3;
        this.player.setFlipX(false);
      }
      if (this.cursors.up.isDown) {
        this.player.y -= 3;
      }
      if (this.cursors.down.isDown) {
        this.player.y += 3;
      }
    }
  }

  switchToIdle() {
    this.currentState = 'idle';
    this.stateChangeCount++;
    
    // 播放 idle 动画
    this.player.play('idle');
    
    // 停止 run 的 tween 效果
    if (this.runTween) {
      this.runTween.stop();
      this.runTween = null;
    }
    
    // 重置缩放
    this.player.setScale(2);
    
    // 更新显示
    this.stateText.setText('State: IDLE');
    this.stateText.setStyle({ fill: '#ffffff' });
    this.counterText.setText(`State Changes: ${this.stateChangeCount}`);
  }

  switchToRun() {
    this.currentState = 'run';
    this.stateChangeCount++;
    
    // 播放 run 动画
    this.player.play('run');
    
    // 添加 tween 缩放效果（run 状态特有）
    if (this.runTween) {
      this.runTween.stop();
    }
    
    this.runTween = this.tweens.add({
      targets: this.player,
      scaleX: 2.2,
      scaleY: 1.9,
      duration: 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // 更新显示
    this.stateText.setText('State: RUN');
    this.stateText.setStyle({ fill: '#00ff00' });
    this.counterText.setText(`State Changes: ${this.stateChangeCount}`);
  }

  generateCharacterTextures() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // 生成 idle 动画的 4 帧（紫色，轻微变化）
    for (let i = 0; i < 4; i++) {
      graphics.clear();
      
      // 身体（矩形，紫色渐变）
      const bodyHeight = 40 + Math.sin(i * Math.PI / 2) * 2; // 轻微呼吸效果
      graphics.fillStyle(0x9933ff, 1);
      graphics.fillRect(16, 20, 32, bodyHeight);
      
      // 头部（圆形）
      graphics.fillStyle(0xbb66ff, 1);
      graphics.fillCircle(32, 16, 12);
      
      // 眼睛
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(28, 14, 3);
      graphics.fillCircle(36, 14, 3);
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(28, 14, 1);
      graphics.fillCircle(36, 14, 1);
      
      graphics.generateTexture(`idle_${i}`, 64, 64);
    }
    
    // 生成 run 动画的 4 帧（更动感的姿态）
    for (let i = 0; i < 4; i++) {
      graphics.clear();
      
      // 身体（倾斜效果）
      const tilt = Math.sin(i * Math.PI / 2) * 5;
      graphics.fillStyle(0x9933ff, 1);
      graphics.save();
      graphics.translate(32, 32);
      graphics.rotate(tilt * 0.1);
      graphics.fillRect(-16, -12, 32, 40);
      graphics.restore();
      
      // 头部
      graphics.fillStyle(0xbb66ff, 1);
      graphics.fillCircle(32 + tilt, 16, 12);
      
      // 眼睛（更有神）
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(28 + tilt, 14, 4);
      graphics.fillCircle(36 + tilt, 14, 4);
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(28 + tilt, 14, 2);
      graphics.fillCircle(36 + tilt, 14, 2);
      
      // 腿部动画（交替）
      graphics.fillStyle(0x7722cc, 1);
      if (i % 2 === 0) {
        graphics.fillRect(20, 60, 8, 4); // 左腿前
        graphics.fillRect(36, 58, 8, 4); // 右腿后
      } else {
        graphics.fillRect(20, 58, 8, 4); // 左腿后
        graphics.fillRect(36, 60, 8, 4); // 右腿前
      }
      
      graphics.generateTexture(`run_${i}`, 64, 64);
    }
    
    graphics.destroy();
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