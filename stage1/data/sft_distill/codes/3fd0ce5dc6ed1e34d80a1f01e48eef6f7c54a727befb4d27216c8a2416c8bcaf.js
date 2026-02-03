class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentState = 'idle';
  }

  preload() {
    // 创建灰色角色的纹理帧
    this.createCharacterTextures();
  }

  createCharacterTextures() {
    const graphics = this.add.graphics();
    
    // 创建 idle 状态的 4 帧动画（灰色方块，轻微变化）
    for (let i = 0; i < 4; i++) {
      graphics.clear();
      graphics.fillStyle(0x808080, 1); // 灰色
      
      // 身体 - 轻微上下浮动
      const bodyY = 20 + Math.sin(i * Math.PI / 2) * 2;
      graphics.fillRect(16, bodyY, 32, 40);
      
      // 头部
      graphics.fillStyle(0x606060, 1);
      graphics.fillCircle(32, bodyY - 8, 12);
      
      // 眼睛
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(28, bodyY - 10, 3);
      graphics.fillCircle(36, bodyY - 10, 3);
      
      graphics.generateTexture(`idle_${i}`, 64, 80);
    }
    
    // 创建 run 状态的 6 帧动画（灰色方块，明显移动）
    for (let i = 0; i < 6; i++) {
      graphics.clear();
      graphics.fillStyle(0x808080, 1);
      
      // 身体 - 前倾姿态
      const lean = Math.sin(i * Math.PI / 3) * 5;
      graphics.fillRect(16 + lean, 25, 32, 35);
      
      // 头部
      graphics.fillStyle(0x606060, 1);
      graphics.fillCircle(32 + lean, 12, 12);
      
      // 眼睛
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(28 + lean, 10, 3);
      graphics.fillCircle(36 + lean, 10, 3);
      
      // 腿部动画
      graphics.fillStyle(0x707070, 1);
      const legOffset = Math.sin(i * Math.PI / 3) * 8;
      graphics.fillRect(20 + lean, 60, 8, 20 + legOffset);
      graphics.fillRect(36 + lean, 60, 8, 20 - legOffset);
      
      graphics.generateTexture(`run_${i}`, 64, 80);
    }
    
    graphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      state: 'idle',
      stateChanges: [],
      timestamp: Date.now()
    };

    // 添加背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 1);
    bg.fillRect(0, 0, 800, 600);

    // 添加地面
    const ground = this.add.graphics();
    ground.fillStyle(0x34495e, 1);
    ground.fillRect(0, 500, 800, 100);

    // 创建角色精灵
    this.player = this.add.sprite(400, 460, 'idle_0');
    this.player.setOrigin(0.5, 1);

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
        { key: 'run_3' },
        { key: 'run_4' },
        { key: 'run_5' }
      ],
      frameRate: 10,
      repeat: -1
    });

    // 播放初始动画
    this.player.play('idle');

    // 添加状态文本显示
    this.stateText = this.add.text(400, 50, 'State: IDLE', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.stateText.setOrigin(0.5);

    // 添加提示文本
    this.instructionText = this.add.text(400, 100, 'Press SPACE for IDLE | Press ENTER for RUN', {
      fontSize: '20px',
      color: '#ecf0f1'
    });
    this.instructionText.setOrigin(0.5);

    // 添加状态切换计数
    this.counterText = this.add.text(400, 550, 'State Changes: 0', {
      fontSize: '18px',
      color: '#95a5a6'
    });
    this.counterText.setOrigin(0.5);

    // 键盘输入监听
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // 监听按键按下事件
    this.spaceKey.on('down', () => {
      this.changeState('idle');
    });

    this.enterKey.on('down', () => {
      this.changeState('run');
    });

    console.log('[Game Started] Initial state: idle');
  }

  changeState(newState) {
    if (this.currentState === newState) {
      return; // 状态未变化
    }

    const oldState = this.currentState;
    this.currentState = newState;

    // 更新信号
    window.__signals__.state = newState;
    window.__signals__.stateChanges.push({
      from: oldState,
      to: newState,
      timestamp: Date.now()
    });

    // 更新文本
    this.stateText.setText(`State: ${newState.toUpperCase()}`);
    this.counterText.setText(`State Changes: ${window.__signals__.stateChanges.length}`);

    // 播放对应动画
    this.player.play(newState);

    // 添加状态切换的 tween 效果
    if (newState === 'idle') {
      // idle 状态：缩放回原样 + 轻微弹跳
      this.tweens.add({
        targets: this.player,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Back.easeOut'
      });

      this.tweens.add({
        targets: this.player,
        y: 460,
        duration: 300,
        ease: 'Bounce.easeOut'
      });

      // 文本颜色变化
      this.tweens.add({
        targets: this.stateText,
        alpha: 0.5,
        yoyo: true,
        duration: 150,
        repeat: 1
      });

    } else if (newState === 'run') {
      // run 状态：稍微拉伸 + 水平抖动
      this.tweens.add({
        targets: this.player,
        scaleX: 1.1,
        scaleY: 0.95,
        duration: 150,
        ease: 'Cubic.easeOut'
      });

      // 添加水平抖动效果
      this.tweens.add({
        targets: this.player,
        x: 410,
        duration: 100,
        yoyo: true,
        repeat: 2,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.player.x = 400;
        }
      });

      // 文本颜色变化
      this.tweens.add({
        targets: this.stateText,
        tint: 0xff6b6b,
        duration: 200,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          this.stateText.clearTint();
        }
      });
    }

    // 输出日志
    console.log(JSON.stringify({
      event: 'stateChange',
      from: oldState,
      to: newState,
      totalChanges: window.__signals__.stateChanges.length,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: GameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);