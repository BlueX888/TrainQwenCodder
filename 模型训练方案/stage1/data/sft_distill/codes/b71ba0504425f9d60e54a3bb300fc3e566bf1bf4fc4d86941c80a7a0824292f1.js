class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerState = 'idle'; // 可验证的状态变量：idle, walk, run
    this.playerSpeed = 0;
    this.playerVelocityX = 0;
  }

  preload() {
    // 创建角色纹理 - 不同状态用不同颜色
    this.createPlayerTextures();
  }

  create() {
    // 创建角色精灵
    this.player = this.add.sprite(400, 300, 'player_idle');
    this.player.setScale(2);

    // 创建状态显示文本
    this.stateText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 创建按键说明文本
    this.add.text(20, 80, '按键说明：\n1 - 静止 (速度: 0)\n2 - 行走 (速度: 80)\n3 - 跑步 (速度: 160)', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 设置键盘输入
    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

    // 方向键控制移动方向
    this.cursors = this.input.keyboard.createCursorKeys();

    // 初始化状态显示
    this.updateStateDisplay();
  }

  update(time, delta) {
    // 检测状态切换按键
    if (Phaser.Input.Keyboard.JustDown(this.key1)) {
      this.changeState('idle');
    } else if (Phaser.Input.Keyboard.JustDown(this.key2)) {
      this.changeState('walk');
    } else if (Phaser.Input.Keyboard.JustDown(this.key3)) {
      this.changeState('run');
    }

    // 根据方向键和当前速度移动角色
    this.playerVelocityX = 0;
    let playerVelocityY = 0;

    if (this.cursors.left.isDown) {
      this.playerVelocityX = -this.playerSpeed;
    } else if (this.cursors.right.isDown) {
      this.playerVelocityX = this.playerSpeed;
    }

    if (this.cursors.up.isDown) {
      playerVelocityY = -this.playerSpeed;
    } else if (this.cursors.down.isDown) {
      playerVelocityY = this.playerSpeed;
    }

    // 应用速度到角色位置（转换为每帧的移动量）
    this.player.x += this.playerVelocityX * (delta / 1000);
    this.player.y += playerVelocityY * (delta / 1000);

    // 限制角色在屏幕范围内
    this.player.x = Phaser.Math.Clamp(this.player.x, 0, 800);
    this.player.y = Phaser.Math.Clamp(this.player.y, 0, 600);

    // 根据移动方向翻转角色
    if (this.playerVelocityX < 0) {
      this.player.setFlipX(true);
    } else if (this.playerVelocityX > 0) {
      this.player.setFlipX(false);
    }
  }

  createPlayerTextures() {
    // 创建静止状态纹理（蓝色）
    const idleGraphics = this.add.graphics();
    idleGraphics.fillStyle(0x0066ff, 1);
    idleGraphics.fillCircle(16, 16, 15);
    idleGraphics.fillRect(8, 30, 16, 20);
    idleGraphics.generateTexture('player_idle', 32, 50);
    idleGraphics.destroy();

    // 创建行走状态纹理（绿色）
    const walkGraphics = this.add.graphics();
    walkGraphics.fillStyle(0x00ff66, 1);
    walkGraphics.fillCircle(16, 16, 15);
    walkGraphics.fillRect(8, 30, 16, 20);
    walkGraphics.generateTexture('player_walk', 32, 50);
    walkGraphics.destroy();

    // 创建跑步状态纹理（红色）
    const runGraphics = this.add.graphics();
    runGraphics.fillStyle(0xff0066, 1);
    runGraphics.fillCircle(16, 16, 15);
    runGraphics.fillRect(8, 30, 16, 20);
    runGraphics.generateTexture('player_run', 32, 50);
    runGraphics.destroy();
  }

  changeState(newState) {
    this.playerState = newState;

    // 根据状态设置速度和纹理
    switch (newState) {
      case 'idle':
        this.playerSpeed = 0;
        this.player.setTexture('player_idle');
        break;
      case 'walk':
        this.playerSpeed = 80;
        this.player.setTexture('player_walk');
        break;
      case 'run':
        this.playerSpeed = 160;
        this.player.setTexture('player_run');
        break;
    }

    this.updateStateDisplay();
  }

  updateStateDisplay() {
    // 更新状态显示文本
    const stateNames = {
      'idle': '静止',
      'walk': '行走',
      'run': '跑步'
    };

    this.stateText.setText(
      `当前状态: ${stateNames[this.playerState]}\n` +
      `速度: ${this.playerSpeed} px/s\n` +
      `位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

new Phaser.Game(config);