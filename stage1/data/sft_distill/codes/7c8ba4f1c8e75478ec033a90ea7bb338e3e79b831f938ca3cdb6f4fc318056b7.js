class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentState = 'idle'; // 可验证的状态信号
    this.stateChangeCount = 0; // 状态切换次数
  }

  preload() {
    // 创建黄色角色的纹理帧
    this.createCharacterTextures();
  }

  createCharacterTextures() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // 创建 idle 状态的 4 帧（轻微变化）
    for (let i = 0; i < 4; i++) {
      graphics.clear();
      
      // 身体（黄色矩形，高度略有变化）
      const bodyHeight = 60 + Math.sin(i * Math.PI / 2) * 5;
      graphics.fillStyle(0xFFD700, 1);
      graphics.fillRect(20, 70 - bodyHeight, 40, bodyHeight);
      
      // 头部（黄色圆形）
      graphics.fillStyle(0xFFDD00, 1);
      graphics.fillCircle(40, 15, 15);
      
      // 眼睛
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(35, 13, 3);
      graphics.fillCircle(45, 13, 3);
      
      // 嘴巴（微笑）
      graphics.lineStyle(2, 0x000000, 1);
      graphics.beginPath();
      graphics.arc(40, 15, 8, 0.2, Math.PI - 0.2);
      graphics.strokePath();
      
      graphics.generateTexture(`idle_${i}`, 80, 80);
    }
    
    // 创建 run 状态的 4 帧（明显的左右倾斜）
    for (let i = 0; i < 4; i++) {
      graphics.clear();
      
      const tilt = Math.sin(i * Math.PI / 2) * 10; // 左右倾斜
      
      // 身体（倾斜的矩形）
      graphics.fillStyle(0xFFD700, 1);
      graphics.save();
      graphics.translateCanvas(40, 40);
      graphics.rotateCanvas(tilt * Math.PI / 180);
      graphics.fillRect(-20, -30, 40, 60);
      graphics.restore();
      
      // 头部（跟随倾斜）
      graphics.fillStyle(0xFFDD00, 1);
      graphics.fillCircle(40 + tilt * 0.5, 15, 15);
      
      // 眼睛（兴奋的表情）
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(35 + tilt * 0.5, 13, 4);
      graphics.fillCircle(45 + tilt * 0.5, 13, 4);
      
      // 嘴巴（张开）
      graphics.fillStyle(0xFF0000, 1);
      graphics.fillCircle(40 + tilt * 0.5, 18, 5);
      
      // 运动线条
      graphics.lineStyle(3, 0xFFFFFF, 0.6);
      graphics.lineBetween(10, 40, 25, 40);
      graphics.lineBetween(55, 40, 70, 40);
      
      graphics.generateTexture(`run_${i}`, 80, 80);
    }
    
    graphics.destroy();
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x87CEEB, 1);
    bg.fillRect(0, 0, 800, 600);
    
    // 创建地面
    const ground = this.add.graphics();
    ground.fillStyle(0x90EE90, 1);
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
        { key: 'idle_2' },
        { key: 'idle_3' }
      ],
      frameRate: 4,
      repeat: -1,
      yoyo: true
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
      frameRate: 10,
      repeat: -1
    });
    
    // 播放初始动画
    this.player.play('idle');
    
    // 添加 idle 状态的浮动 tween
    this.idleTween = this.tweens.add({
      targets: this.player,
      y: 440,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
    
    // 创建状态显示文本
    this.stateText = this.add.text(400, 100, 'State: IDLE', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.stateText.setOrigin(0.5);
    
    // 创建计数器文本
    this.counterText = this.add.text(400, 150, 'State Changes: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 15, y: 8 }
    });
    this.counterText.setOrigin(0.5);
    
    // 创建提示文本
    this.add.text(400, 550, 'Press [I] for IDLE | Press [R] for RUN', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#000000',
      backgroundColor: '#ffffff',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);
    
    // 设置键盘输入
    this.keyI = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    
    // 监听按键事件
    this.keyI.on('down', () => this.switchState('idle'));
    this.keyR.on('down', () => this.switchState('run'));
  }

  switchState(newState) {
    if (this.currentState === newState) return;
    
    this.currentState = newState;
    this.stateChangeCount++;
    
    // 更新文本
    this.stateText.setText(`State: ${newState.toUpperCase()}`);
    this.counterText.setText(`State Changes: ${this.stateChangeCount}`);
    
    // 停止所有 tweens
    this.tweens.killTweensOf(this.player);
    
    if (newState === 'idle') {
      // 切换到 idle 动画
      this.player.play('idle');
      
      // 重置位置和缩放
      this.tweens.add({
        targets: this.player,
        y: 450,
        scaleX: 2,
        scaleY: 2,
        duration: 300,
        ease: 'Back.easeOut'
      });
      
      // 添加浮动效果
      this.tweens.add({
        targets: this.player,
        y: 440,
        duration: 1000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: 300
      });
      
      // 状态文本颜色变化
      this.tweens.add({
        targets: this.stateText,
        alpha: 0.7,
        duration: 200,
        yoyo: true
      });
      
    } else if (newState === 'run') {
      // 切换到 run 动画
      this.player.play('run');
      
      // 缩放变化（跑步时略大）
      this.tweens.add({
        targets: this.player,
        scaleX: 2.3,
        scaleY: 2.3,
        duration: 200,
        ease: 'Back.easeOut'
      });
      
      // 快速左右移动
      this.tweens.add({
        targets: this.player,
        x: 450,
        duration: 500,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
      
      // 轻微跳跃
      this.tweens.add({
        targets: this.player,
        y: 430,
        duration: 250,
        ease: 'Quad.easeOut',
        yoyo: true,
        repeat: -1
      });
      
      // 状态文本闪烁
      this.tweens.add({
        targets: this.stateText,
        alpha: 0.5,
        duration: 150,
        yoyo: true,
        repeat: -1
      });
    }
    
    // 播放切换音效（视觉反馈）
    this.cameras.main.shake(100, 0.002);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 例如：根据状态改变背景颜色
    if (this.currentState === 'run' && Math.floor(time / 100) % 2 === 0) {
      // 跑步时背景略微闪烁
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  pixelArt: false,
  antialias: true
};

new Phaser.Game(config);