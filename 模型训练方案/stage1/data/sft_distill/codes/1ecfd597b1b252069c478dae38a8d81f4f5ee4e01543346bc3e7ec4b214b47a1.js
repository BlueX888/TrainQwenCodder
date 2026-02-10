class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentState = 'idle';
    this.stateChangeCount = 0;
  }

  preload() {
    // 创建紫色角色的 idle 状态纹理（站立姿态）
    this.createIdleTextures();
    // 创建紫色角色的 run 状态纹理（跑步姿态）
    this.createRunTextures();
  }

  createIdleTextures() {
    // 创建 idle 动画的两帧
    for (let i = 0; i < 2; i++) {
      const graphics = this.add.graphics();
      
      // 身体（紫色矩形）
      graphics.fillStyle(0x9b59b6, 1);
      graphics.fillRect(16, 20, 32, 40);
      
      // 头部（紫色圆形）
      graphics.fillStyle(0x8e44ad, 1);
      graphics.fillCircle(32, 15, 12);
      
      // 眼睛
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(28, 13, 3);
      graphics.fillCircle(36, 13, 3);
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(28, 13, 1.5);
      graphics.fillCircle(36, 13, 1.5);
      
      // 手臂（根据帧数微调位置）
      const armOffset = i === 0 ? 0 : 2;
      graphics.fillStyle(0x9b59b6, 1);
      graphics.fillRect(10, 25 + armOffset, 6, 20);
      graphics.fillRect(48, 25 + armOffset, 6, 20);
      
      // 腿部
      graphics.fillStyle(0x8e44ad, 1);
      graphics.fillRect(20, 60, 8, 20);
      graphics.fillRect(36, 60, 8, 20);
      
      graphics.generateTexture(`idle_${i}`, 64, 80);
      graphics.destroy();
    }
  }

  createRunTextures() {
    // 创建 run 动画的四帧
    for (let i = 0; i < 4; i++) {
      const graphics = this.add.graphics();
      
      // 身体（稍微倾斜）
      graphics.fillStyle(0x9b59b6, 1);
      graphics.fillRect(16, 18, 32, 40);
      
      // 头部
      graphics.fillStyle(0x8e44ad, 1);
      graphics.fillCircle(32, 13, 12);
      
      // 眼睛（跑步时更专注）
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(29, 12, 3);
      graphics.fillCircle(37, 12, 3);
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(29, 12, 1.5);
      graphics.fillCircle(37, 12, 1.5);
      
      // 手臂（跑步摆动）
      const armAngle = Math.sin(i * Math.PI / 2) * 10;
      graphics.fillStyle(0x9b59b6, 1);
      graphics.fillRect(8, 22 + armAngle, 8, 22);
      graphics.fillRect(48, 22 - armAngle, 8, 22);
      
      // 腿部（跑步姿态）
      const legOffset = i % 2 === 0 ? 5 : -5;
      graphics.fillStyle(0x8e44ad, 1);
      graphics.fillRect(18, 58 + legOffset, 10, 22);
      graphics.fillRect(36, 58 - legOffset, 10, 22);
      
      graphics.generateTexture(`run_${i}`, 64, 80);
      graphics.destroy();
    }
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x34495e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建地面
    const ground = this.add.graphics();
    ground.fillStyle(0x2c3e50, 1);
    ground.fillRect(0, 500, 800, 100);

    // 创建角色精灵
    this.player = this.add.sprite(400, 450, 'idle_0');
    this.player.setScale(2);

    // 创建 idle 动画
    this.anims.create({
      key: 'idle',
      frames: [
        { key: 'idle_0' },
        { key: 'idle_1' }
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
      frameRate: 10,
      repeat: -1
    });

    // 播放初始 idle 动画
    this.player.play('idle');

    // 创建 idle 状态的浮动 tween
    this.idleTween = this.tweens.add({
      targets: this.player,
      y: 440,
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      paused: false
    });

    // 创建 run 状态的摆动 tween（初始暂停）
    this.runTween = this.tweens.add({
      targets: this.player,
      angle: -5,
      duration: 200,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      paused: true
    });

    // 状态显示文本
    this.stateText = this.add.text(20, 20, '', {
      fontSize: '28px',
      fill: '#fff',
      fontFamily: 'Arial',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });

    // 计数器显示
    this.counterText = this.add.text(20, 60, '', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });

    // 提示文本
    this.add.text(400, 550, 'Press [I] for IDLE  |  Press [R] for RUN', {
      fontSize: '22px',
      fill: '#ecf0f1',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 键盘输入
    this.keyI = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // 监听按键按下
    this.keyI.on('down', () => this.switchState('idle'));
    this.keyR.on('down', () => this.switchState('run'));

    // 初始化状态显示
    this.updateStateDisplay();
  }

  switchState(newState) {
    if (this.currentState === newState) return;

    this.currentState = newState;
    this.stateChangeCount++;

    if (newState === 'idle') {
      // 切换到 idle 状态
      this.player.play('idle');
      this.player.setAngle(0);
      
      // 启动 idle tween，停止 run tween
      this.idleTween.resume();
      this.runTween.pause();
      
      // 添加切换效果
      this.tweens.add({
        targets: this.player,
        scaleX: 2.2,
        scaleY: 1.8,
        duration: 100,
        yoyo: true,
        ease: 'Quad.easeOut'
      });

    } else if (newState === 'run') {
      // 切换到 run 状态
      this.player.play('run');
      
      // 停止 idle tween，启动 run tween
      this.idleTween.pause();
      this.player.y = 450; // 重置 y 位置
      this.runTween.resume();
      
      // 添加切换效果
      this.tweens.add({
        targets: this.player,
        scaleX: 1.8,
        scaleY: 2.2,
        duration: 100,
        yoyo: true,
        ease: 'Quad.easeOut'
      });
    }

    this.updateStateDisplay();
  }

  updateStateDisplay() {
    const stateColor = this.currentState === 'idle' ? '#3498db' : '#e74c3c';
    this.stateText.setText(`State: ${this.currentState.toUpperCase()}`);
    this.stateText.setBackgroundColor(stateColor);
    
    this.counterText.setText(`Switches: ${this.stateChangeCount}`);
  }

  update(time, delta) {
    // 每帧更新逻辑（如果需要）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: GameScene,
  pixelArt: false
};

new Phaser.Game(config);