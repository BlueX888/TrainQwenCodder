class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentState = 'idle'; // 状态信号变量
    this.stateChangeCount = 0; // 状态切换次数
  }

  preload() {
    // 生成紫色角色的纹理帧
    this.generateCharacterFrames();
  }

  generateCharacterFrames() {
    const graphics = this.add.graphics();
    
    // 生成 idle 状态的 4 帧（紫色，轻微呼吸效果）
    for (let i = 0; i < 4; i++) {
      graphics.clear();
      
      // 身体（矩形，根据帧数略微缩放）
      const scale = 1 + Math.sin(i * Math.PI / 2) * 0.05;
      const bodyWidth = 40 * scale;
      const bodyHeight = 60 * scale;
      
      graphics.fillStyle(0x9b59b6, 1); // 紫色
      graphics.fillRect(32 - bodyWidth / 2, 32 - bodyHeight / 2, bodyWidth, bodyHeight);
      
      // 眼睛
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(24, 26, 4);
      graphics.fillCircle(40, 26, 4);
      
      // 瞳孔
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(24, 26, 2);
      graphics.fillCircle(40, 26, 2);
      
      graphics.generateTexture(`idle_${i}`, 64, 64);
    }
    
    // 生成 run 状态的 4 帧（紫色，跑步动作）
    for (let i = 0; i < 4; i++) {
      graphics.clear();
      
      // 身体（倾斜效果）
      const tilt = Math.sin(i * Math.PI / 2) * 5;
      graphics.fillStyle(0x8e44ad, 1); // 深紫色
      
      graphics.save();
      graphics.translateCanvas(32, 32);
      graphics.rotateCanvas(tilt * Math.PI / 180);
      graphics.fillRect(-20, -30, 40, 60);
      graphics.restore();
      
      // 眼睛（更有活力）
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(24, 26, 5);
      graphics.fillCircle(40, 26, 5);
      
      // 瞳孔
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(25, 26, 2);
      graphics.fillCircle(41, 26, 2);
      
      // 运动线条
      graphics.lineStyle(2, 0xe74c3c, 0.6);
      graphics.beginPath();
      graphics.moveTo(10 - i * 5, 32);
      graphics.lineTo(5 - i * 5, 32);
      graphics.strokePath();
      
      graphics.generateTexture(`run_${i}`, 64, 64);
    }
    
    graphics.destroy();
  }

  create() {
    // 创建角色精灵
    this.player = this.add.sprite(400, 300, 'idle_0');
    this.player.setScale(2);
    
    // 创建 idle 动画
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
    
    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 状态显示文本
    this.stateText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 说明文本
    this.add.text(16, 550, 'Press SPACE for IDLE | Arrow Keys for RUN', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    });
    
    // 初始化 tween 引用
    this.moveTween = null;
    
    this.updateStateText();
  }

  update() {
    // 检测空格键切换到 idle
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.switchToIdle();
    }
    
    // 检测方向键切换到 run
    if (this.cursors.left.isDown || this.cursors.right.isDown || 
        this.cursors.up.isDown || this.cursors.down.isDown) {
      this.switchToRun();
      
      // 根据方向移动角色
      if (this.currentState === 'run') {
        const speed = 3;
        if (this.cursors.left.isDown) {
          this.player.x -= speed;
          this.player.setFlipX(true);
        }
        if (this.cursors.right.isDown) {
          this.player.x += speed;
          this.player.setFlipX(false);
        }
        if (this.cursors.up.isDown) {
          this.player.y -= speed;
        }
        if (this.cursors.down.isDown) {
          this.player.y += speed;
        }
        
        // 限制在屏幕内
        this.player.x = Phaser.Math.Clamp(this.player.x, 64, 736);
        this.player.y = Phaser.Math.Clamp(this.player.y, 64, 536);
      }
    }
  }

  switchToIdle() {
    if (this.currentState !== 'idle') {
      this.currentState = 'idle';
      this.stateChangeCount++;
      
      // 播放 idle 动画
      this.player.play('idle');
      
      // 停止移动 tween
      if (this.moveTween) {
        this.moveTween.stop();
        this.moveTween = null;
      }
      
      // 添加缩放 tween 效果（呼吸感）
      this.tweens.add({
        targets: this.player,
        scaleX: 2.1,
        scaleY: 2.1,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      this.updateStateText();
    }
  }

  switchToRun() {
    if (this.currentState !== 'run') {
      this.currentState = 'run';
      this.stateChangeCount++;
      
      // 播放 run 动画
      this.player.play('run');
      
      // 停止所有现有 tween
      this.tweens.killTweensOf(this.player);
      
      // 添加轻微的上下跳动 tween 效果
      this.moveTween = this.tweens.add({
        targets: this.player,
        y: this.player.y - 10,
        scaleX: 2,
        scaleY: 2,
        duration: 150,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      this.updateStateText();
    }
  }

  updateStateText() {
    this.stateText.setText(
      `State: ${this.currentState.toUpperCase()}\n` +
      `Switches: ${this.stateChangeCount}\n` +
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: GameScene,
  pixelArt: true
};

new Phaser.Game(config);