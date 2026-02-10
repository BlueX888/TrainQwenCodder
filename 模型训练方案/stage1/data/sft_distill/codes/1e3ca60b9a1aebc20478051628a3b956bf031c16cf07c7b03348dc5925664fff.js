class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentState = 'idle'; // 可验证的状态变量
  }

  preload() {
    // 创建黄色角色的多帧纹理
    this.createCharacterFrames();
  }

  createCharacterFrames() {
    const graphics = this.add.graphics();
    
    // 创建 idle 状态的3帧（黄色方块，轻微变化）
    for (let i = 0; i < 3; i++) {
      graphics.clear();
      graphics.fillStyle(0xffff00, 1); // 黄色
      
      // 轻微的大小变化模拟呼吸效果
      const size = 50 + i * 2;
      const offset = (50 - size) / 2;
      graphics.fillRect(offset, offset, size, size);
      
      // 添加眼睛
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(15, 20, 3);
      graphics.fillCircle(35, 20, 3);
      
      graphics.generateTexture(`idle_${i}`, 50, 50);
    }
    
    // 创建 run 状态的4帧（黄色方块，倾斜和拉伸）
    for (let i = 0; i < 4; i++) {
      graphics.clear();
      graphics.fillStyle(0xffff00, 1);
      
      // 跑步时的形变效果
      const skew = i % 2 === 0 ? 5 : -5;
      graphics.fillRect(skew, 0, 50, 50);
      
      // 添加眼睛（跑步时眼睛更有动感）
      graphics.fillStyle(0x000000, 1);
      const eyeOffset = i % 2 === 0 ? 2 : -2;
      graphics.fillCircle(15 + eyeOffset, 20, 3);
      graphics.fillCircle(35 + eyeOffset, 20, 3);
      
      // 添加运动线条
      graphics.lineStyle(2, 0xffff00, 0.5);
      graphics.lineBetween(-10, 15 + i * 5, 0, 15 + i * 5);
      graphics.lineBetween(-10, 35 + i * 5, 0, 35 + i * 5);
      
      graphics.generateTexture(`run_${i}`, 50, 50);
    }
    
    graphics.destroy();
  }

  create() {
    // 添加背景
    const bg = this.add.graphics();
    bg.fillStyle(0x87ceeb, 1);
    bg.fillRect(0, 0, 800, 600);
    
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
        { key: 'idle_1' }
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
      frameRate: 10,
      repeat: -1
    });
    
    // 默认播放 idle 动画
    this.player.play('idle');
    
    // 添加状态文本显示
    this.stateText = this.add.text(400, 100, 'State: IDLE', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.stateText.setOrigin(0.5);
    
    // 添加提示文本
    this.add.text(400, 500, 'Press [1] for IDLE  |  Press [2] for RUN', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // 键盘输入监听
    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    
    // 监听按键按下事件
    this.key1.on('down', () => this.switchState('idle'));
    this.key2.on('down', () => this.switchState('run'));
    
    // 添加粒子效果容器
    this.particleGraphics = this.add.graphics();
  }

  switchState(newState) {
    if (this.currentState === newState) return;
    
    this.currentState = newState;
    
    // 停止所有正在进行的 tween
    this.tweens.killTweensOf(this.player);
    
    if (newState === 'idle') {
      // 切换到 idle 状态
      this.player.play('idle');
      this.stateText.setText('State: IDLE');
      
      // idle 状态的 tween：轻微上下浮动
      this.tweens.add({
        targets: this.player,
        y: 300 - 10,
        duration: 1000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
      
      // 缩放回正常
      this.tweens.add({
        targets: this.player,
        scaleX: 2,
        scaleY: 2,
        duration: 300,
        ease: 'Back.easeOut'
      });
      
    } else if (newState === 'run') {
      // 切换到 run 状态
      this.player.play('run');
      this.stateText.setText('State: RUN');
      
      // run 状态的 tween：左右快速移动
      this.tweens.add({
        targets: this.player,
        x: 600,
        duration: 1500,
        ease: 'Linear',
        yoyo: true,
        repeat: -1
      });
      
      // 轻微倾斜效果
      this.tweens.add({
        targets: this.player,
        angle: -5,
        duration: 150,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
      
      // 轻微拉伸效果
      this.tweens.add({
        targets: this.player,
        scaleX: 2.2,
        scaleY: 1.9,
        duration: 300,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    }
    
    // 状态切换时的闪烁效果
    this.tweens.add({
      targets: this.stateText,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    });
  }

  update(time, delta) {
    // 在 run 状态下添加拖尾粒子效果
    if (this.currentState === 'run' && Math.random() > 0.7) {
      this.particleGraphics.clear();
      this.particleGraphics.fillStyle(0xffff00, 0.3);
      
      for (let i = 0; i < 3; i++) {
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        this.particleGraphics.fillCircle(
          this.player.x + offsetX - 30,
          this.player.y + offsetY,
          5
        );
      }
      
      // 粒子淡出
      this.tweens.add({
        targets: this.particleGraphics,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          this.particleGraphics.clear();
          this.particleGraphics.alpha = 1;
        }
      });
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  pixelArt: false,
  parent: 'game-container'
};

new Phaser.Game(config);