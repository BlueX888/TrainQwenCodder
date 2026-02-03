class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentState = 'idle'; // 状态信号
    this.stateChangeCount = 0; // 状态切换计数
  }

  preload() {
    // 程序化生成粉色角色纹理
    this.generateCharacterTextures();
  }

  generateCharacterTextures() {
    const graphics = this.add.graphics();
    
    // 生成 idle 动画帧（4 帧，轻微上下浮动效果）
    for (let i = 0; i < 4; i++) {
      graphics.clear();
      
      // 粉色身体（圆角矩形）
      const offsetY = Math.sin(i * Math.PI / 2) * 2; // 轻微浮动
      graphics.fillStyle(0xff69b4, 1);
      graphics.fillRoundedRect(8, 16 + offsetY, 48, 64, 8);
      
      // 眼睛
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(24, 36 + offsetY, 4);
      graphics.fillCircle(40, 36 + offsetY, 4);
      
      // 嘴巴
      graphics.lineStyle(2, 0x000000, 1);
      graphics.beginPath();
      graphics.arc(32, 48 + offsetY, 8, 0, Math.PI, false);
      graphics.strokePath();
      
      graphics.generateTexture(`idle_${i}`, 64, 96);
    }
    
    // 生成 run 动画帧（4 帧，腿部摆动效果）
    for (let i = 0; i < 4; i++) {
      graphics.clear();
      
      // 粉色身体
      graphics.fillStyle(0xff69b4, 1);
      graphics.fillRoundedRect(8, 16, 48, 64, 8);
      
      // 眼睛（跑步时更专注，眼睛稍微眯起）
      graphics.fillStyle(0x000000, 1);
      graphics.fillEllipse(24, 36, 4, 3);
      graphics.fillEllipse(40, 36, 4, 3);
      
      // 嘴巴（O 形表示喘气）
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(32, 48, 4);
      
      // 腿部动画（交替摆动）
      const legOffset = Math.sin(i * Math.PI / 2) * 8;
      graphics.fillStyle(0xff1493, 1);
      
      // 左腿
      graphics.fillRect(16, 76, 8, 16 + legOffset);
      
      // 右腿
      graphics.fillRect(40, 76, 8, 16 - legOffset);
      
      // 手臂摆动
      graphics.fillRect(4, 40 - legOffset / 2, 8, 20);
      graphics.fillRect(52, 40 + legOffset / 2, 8, 20);
      
      graphics.generateTexture(`run_${i}`, 64, 96);
    }
    
    graphics.destroy();
  }

  create() {
    // 添加背景
    const bg = this.add.graphics();
    bg.fillStyle(0x87ceeb, 1);
    bg.fillRect(0, 0, 800, 600);
    
    // 添加地面
    const ground = this.add.graphics();
    ground.fillStyle(0x90ee90, 1);
    ground.fillRect(0, 500, 800, 100);
    
    // 创建角色精灵
    this.character = this.add.sprite(400, 450, 'idle_0');
    this.character.setScale(1.5);
    
    // 创建 idle 动画
    this.anims.create({
      key: 'idle',
      frames: [
        { key: 'idle_0' },
        { key: 'idle_1' },
        { key: 'idle_2' },
        { key: 'idle_3' }
      ],
      frameRate: 6,
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
    
    // 播放初始 idle 动画
    this.character.play('idle');
    
    // 添加状态显示文本
    this.stateText = this.add.text(400, 50, 'State: IDLE', {
      fontSize: '32px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // 添加计数显示
    this.countText = this.add.text(400, 100, 'State Changes: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // 添加提示文本
    this.add.text(400, 550, 'Press [I] for IDLE | Press [R] for RUN', {
      fontSize: '20px',
      fill: '#333333'
    }).setOrigin(0.5);
    
    // 绑定按键
    this.keyI = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    
    // 按键事件监听
    this.keyI.on('down', () => this.switchState('idle'));
    this.keyR.on('down', () => this.switchState('run'));
    
    // 用于存储 tween 引用
    this.runTween = null;
  }

  switchState(newState) {
    if (this.currentState === newState) {
      return; // 已经是当前状态，不切换
    }
    
    this.currentState = newState;
    this.stateChangeCount++;
    
    // 更新显示文本
    this.stateText.setText(`State: ${newState.toUpperCase()}`);
    this.countText.setText(`State Changes: ${this.stateChangeCount}`);
    
    // 停止之前的 tween
    if (this.runTween) {
      this.runTween.stop();
      this.runTween = null;
    }
    
    if (newState === 'idle') {
      // 切换到 idle 动画
      this.character.play('idle');
      
      // 重置位置（带缓动效果）
      this.tweens.add({
        targets: this.character,
        x: 400,
        duration: 500,
        ease: 'Power2'
      });
      
      // 添加轻微的上下浮动 tween
      this.tweens.add({
        targets: this.character,
        y: 445,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
    } else if (newState === 'run') {
      // 切换到 run 动画
      this.character.play('run');
      
      // 停止浮动效果
      this.tweens.killTweensOf(this.character);
      
      // 添加左右移动 tween
      this.runTween = this.tweens.add({
        targets: this.character,
        x: 700,
        y: 450,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Linear',
        onYoyo: () => {
          // 转向
          this.character.setFlipX(true);
        },
        onRepeat: () => {
          // 转向
          this.character.setFlipX(false);
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
  backgroundColor: '#87ceeb',
  scene: GameScene,
  parent: 'game-container'
};

new Phaser.Game(config);