// 蓝色角色状态切换游戏
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentState = 'idle';
    this.player = null;
    this.idleTween = null;
    this.runTween = null;
  }

  preload() {
    // 程序化生成蓝色角色纹理
    this.generatePlayerTextures();
  }

  generatePlayerTextures() {
    // 生成 idle 状态纹理（3帧）
    for (let i = 0; i < 3; i++) {
      const graphics = this.add.graphics();
      
      // 蓝色身体
      graphics.fillStyle(0x0066ff, 1);
      graphics.fillRoundedRect(8, 16, 48, 48, 8);
      
      // 眼睛（随帧变化）
      graphics.fillStyle(0xffffff, 1);
      const eyeOffset = i * 2;
      graphics.fillCircle(24 + eyeOffset, 32, 4);
      graphics.fillCircle(40 + eyeOffset, 32, 4);
      
      // 瞳孔
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(24 + eyeOffset, 32, 2);
      graphics.fillCircle(40 + eyeOffset, 2, 2);
      
      // 微笑
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.beginPath();
      graphics.arc(32, 40, 10, 0, Math.PI, false);
      graphics.strokePath();
      
      graphics.generateTexture(`idle_${i}`, 64, 64);
      graphics.destroy();
    }
    
    // 生成 run 状态纹理（4帧，带动态效果）
    for (let i = 0; i < 4; i++) {
      const graphics = this.add.graphics();
      
      // 蓝色身体（倾斜表示奔跑）
      graphics.fillStyle(0x0066ff, 1);
      const tilt = (i % 2 === 0) ? -5 : 5;
      graphics.fillRoundedRect(8 + tilt, 16, 48, 48, 8);
      
      // 眼睛（更专注）
      graphics.fillStyle(0xffffff, 1);
      graphics.fillEllipse(24, 32, 6, 4);
      graphics.fillEllipse(40, 32, 6, 4);
      
      // 瞳孔
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(26, 32, 2);
      graphics.fillCircle(42, 32, 2);
      
      // 运动线条
      graphics.lineStyle(3, 0x00aaff, 0.8);
      graphics.beginPath();
      graphics.moveTo(0, 30 + i * 5);
      graphics.lineTo(15, 30 + i * 5);
      graphics.strokePath();
      
      graphics.generateTexture(`run_${i}`, 64, 64);
      graphics.destroy();
    }
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      state: 'idle',
      stateChanges: 0,
      position: { x: 400, y: 300 },
      timestamp: Date.now()
    };

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 添加地面
    const ground = this.add.graphics();
    ground.fillStyle(0x16213e, 1);
    ground.fillRect(0, 500, 800, 100);

    // 创建角色
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

    // 播放初始动画
    this.player.play('idle');

    // 创建 idle 状态的浮动 tween
    this.createIdleTween();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加状态文本
    this.stateText = this.add.text(20, 20, 'State: IDLE', {
      fontSize: '24px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });

    this.instructionText = this.add.text(20, 50, 'SPACE: Toggle State | Arrow Keys: Move (Run)', {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 空格键切换状态
    this.spaceKey.on('down', () => {
      this.toggleState();
    });

    // 日志输出
    console.log(JSON.stringify({
      event: 'game_start',
      state: this.currentState,
      timestamp: Date.now()
    }));
  }

  createIdleTween() {
    // 停止之前的 tween
    if (this.idleTween) {
      this.idleTween.stop();
    }
    if (this.runTween) {
      this.runTween.stop();
    }

    // idle 状态：上下浮动
    this.idleTween = this.tweens.add({
      targets: this.player,
      y: this.player.y - 20,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  createRunTween() {
    // 停止之前的 tween
    if (this.idleTween) {
      this.idleTween.stop();
    }
    if (this.runTween) {
      this.runTween.stop();
    }

    // run 状态：轻微抖动效果
    this.runTween = this.tweens.add({
      targets: this.player,
      scaleX: 2.1,
      scaleY: 1.9,
      duration: 100,
      ease: 'Power1',
      yoyo: true,
      repeat: -1
    });
  }

  toggleState() {
    if (this.currentState === 'idle') {
      this.currentState = 'run';
      this.player.play('run');
      this.createRunTween();
      this.stateText.setText('State: RUN');
      this.stateText.setColor('#ff0000');
    } else {
      this.currentState = 'idle';
      this.player.play('idle');
      this.createIdleTween();
      this.stateText.setText('State: IDLE');
      this.stateText.setColor('#00ff00');
      // 恢复原始缩放
      this.player.setScale(2);
    }

    // 更新信号
    window.__signals__.state = this.currentState;
    window.__signals__.stateChanges++;
    window.__signals__.timestamp = Date.now();

    // 日志输出
    console.log(JSON.stringify({
      event: 'state_change',
      newState: this.currentState,
      stateChanges: window.__signals__.stateChanges,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 方向键移动（只在 run 状态下生效）
    if (this.currentState === 'run') {
      const speed = 5;
      let moved = false;

      if (this.cursors.left.isDown) {
        this.player.x -= speed;
        this.player.setFlipX(true);
        moved = true;
      } else if (this.cursors.right.isDown) {
        this.player.x += speed;
        this.player.setFlipX(false);
        moved = true;
      }

      if (this.cursors.up.isDown) {
        this.player.y -= speed;
        moved = true;
      } else if (this.cursors.down.isDown) {
        this.player.y += speed;
        moved = true;
      }

      // 限制边界
      this.player.x = Phaser.Math.Clamp(this.player.x, 50, 750);
      this.player.y = Phaser.Math.Clamp(this.player.y, 50, 450);

      // 更新位置信号
      if (moved) {
        window.__signals__.position = {
          x: Math.round(this.player.x),
          y: Math.round(this.player.y)
        };
      }
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: GameScene,
  pixelArt: false,
  parent: 'game-container'
};

// 启动游戏
const game = new Phaser.Game(config);