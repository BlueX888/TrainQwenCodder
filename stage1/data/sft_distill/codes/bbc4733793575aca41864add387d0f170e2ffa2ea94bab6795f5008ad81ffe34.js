class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentState = 'idle'; // 状态信号变量
    this.currentSpeed = 0;
  }

  preload() {
    // 程序化生成纹理
    this.createPlayerTextures();
  }

  create() {
    // 创建带物理的角色
    this.player = this.physics.add.sprite(400, 300, 'player_idle');
    this.player.setCollideWorldBounds(true);

    // 创建状态显示文本
    this.stateText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建说明文本
    this.add.text(16, 60, '按键: 1-静止  2-行走  3-跑步', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建速度显示文本
    this.speedText = this.add.text(16, 100, '', {
      fontSize: '18px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置键盘输入
    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

    // 方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 初始化状态
    this.setState('idle');
  }

  update() {
    // 监听状态切换按键
    if (Phaser.Input.Keyboard.JustDown(this.key1)) {
      this.setState('idle');
    } else if (Phaser.Input.Keyboard.JustDown(this.key2)) {
      this.setState('walk');
    } else if (Phaser.Input.Keyboard.JustDown(this.key3)) {
      this.setState('run');
    }

    // 根据状态和方向键移动角色
    this.player.setVelocity(0, 0);

    if (this.currentState !== 'idle') {
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-this.currentSpeed);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(this.currentSpeed);
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-this.currentSpeed);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(this.currentSpeed);
      }
    }

    // 更新显示信息
    this.updateDisplay();
  }

  createPlayerTextures() {
    // 创建静止状态纹理（蓝色）
    const idleGraphics = this.add.graphics();
    idleGraphics.fillStyle(0x0000ff, 1);
    idleGraphics.fillRect(0, 0, 40, 40);
    idleGraphics.fillStyle(0xffffff, 1);
    idleGraphics.fillCircle(20, 15, 5); // 眼睛
    idleGraphics.generateTexture('player_idle', 40, 40);
    idleGraphics.destroy();

    // 创建行走状态纹理（绿色）
    const walkGraphics = this.add.graphics();
    walkGraphics.fillStyle(0x00ff00, 1);
    walkGraphics.fillRect(0, 0, 40, 40);
    walkGraphics.fillStyle(0xffffff, 1);
    walkGraphics.fillCircle(20, 15, 5);
    walkGraphics.fillStyle(0x000000, 1);
    walkGraphics.fillRect(10, 25, 8, 3); // 腿部标记
    walkGraphics.fillRect(22, 25, 8, 3);
    walkGraphics.generateTexture('player_walk', 40, 40);
    walkGraphics.destroy();

    // 创建跑步状态纹理（红色）
    const runGraphics = this.add.graphics();
    runGraphics.fillStyle(0xff0000, 1);
    runGraphics.fillRect(0, 0, 40, 40);
    runGraphics.fillStyle(0xffffff, 1);
    runGraphics.fillCircle(20, 15, 5);
    runGraphics.fillStyle(0xffff00, 1);
    runGraphics.fillRect(5, 22, 12, 4); // 动态线条
    runGraphics.fillRect(23, 22, 12, 4);
    runGraphics.generateTexture('player_run', 40, 40);
    runGraphics.destroy();
  }

  setState(state) {
    this.currentState = state;

    // 根据状态设置速度和纹理
    switch (state) {
      case 'idle':
        this.currentSpeed = 0;
        this.player.setTexture('player_idle');
        break;
      case 'walk':
        this.currentSpeed = 160;
        this.player.setTexture('player_walk');
        break;
      case 'run':
        this.currentSpeed = 160 * 2;
        this.player.setTexture('player_run');
        break;
    }
  }

  updateDisplay() {
    // 更新状态文本
    const stateNames = {
      'idle': '静止',
      'walk': '行走',
      'run': '跑步'
    };
    this.stateText.setText(`当前状态: ${stateNames[this.currentState]}`);

    // 更新速度文本
    const actualSpeed = Math.sqrt(
      this.player.body.velocity.x ** 2 + 
      this.player.body.velocity.y ** 2
    ).toFixed(1);
    this.speedText.setText(
      `设定速度: ${this.currentSpeed} | 实际速度: ${actualSpeed}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);