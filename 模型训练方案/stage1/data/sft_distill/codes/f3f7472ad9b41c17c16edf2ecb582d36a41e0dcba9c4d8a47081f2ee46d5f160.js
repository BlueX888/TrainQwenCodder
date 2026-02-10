class SplitScreenGame extends Phaser.Scene {
  constructor() {
    super('SplitScreenGame');
    this.collisionCount = 0; // 状态信号：碰撞计数
    this.player1Score = 0;
    this.player2Score = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建玩家1纹理（蓝色方块）
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0x0088ff, 1);
    graphics1.fillRect(0, 0, 32, 32);
    graphics1.generateTexture('player1Tex', 32, 32);
    graphics1.destroy();

    // 创建玩家2纹理（红色方块）
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xff0044, 1);
    graphics2.fillRect(0, 0, 32, 32);
    graphics2.generateTexture('player2Tex', 32, 32);
    graphics2.destroy();

    // 创建背景网格（用于视觉参考）
    this.createGrid();

    // 创建玩家1（左侧起始位置）
    this.player1 = this.physics.add.sprite(200, height / 2, 'player1Tex');
    this.player1.setCollideWorldBounds(true);
    this.player1.setBounce(0.5); // 设置弹性
    this.player1.setDamping(true);
    this.player1.setDrag(0.95);

    // 创建玩家2（右侧起始位置）
    this.player2 = this.physics.add.sprite(width - 200, height / 2, 'player2Tex');
    this.player2.setCollideWorldBounds(true);
    this.player2.setBounce(0.5); // 设置弹性
    this.player2.setDamping(true);
    this.player2.setDrag(0.95);

    // 设置玩家之间的碰撞，碰撞时双方弹开
    this.physics.add.collider(this.player1, this.player2, () => {
      this.collisionCount++;
      console.log('Collision detected! Count:', this.collisionCount);
    });

    // 配置键盘输入
    // 玩家1使用 WASD
    this.keys1 = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 玩家2使用方向键
    this.keys2 = this.input.keyboard.createCursorKeys();

    // 设置分屏摄像机
    this.setupCameras();

    // 创建UI文本显示
    this.createUI();
  }

  createGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const gridSize = 50;

    // 绘制网格
    for (let x = 0; x <= width; x += gridSize) {
      graphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      graphics.lineBetween(0, y, width, y);
    }

    // 绘制中线
    graphics.lineStyle(2, 0x666666, 1);
    graphics.lineBetween(width / 2, 0, width / 2, height);
  }

  setupCameras() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 主摄像机（左半屏）跟随玩家1
    this.cameras.main.setViewport(0, 0, width / 2, height);
    this.cameras.main.startFollow(this.player1, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    this.cameras.main.setBounds(0, 0, width, height);

    // 添加第二个摄像机（右半屏）跟随玩家2
    this.camera2 = this.cameras.add(width / 2, 0, width / 2, height);
    this.camera2.startFollow(this.player2, true, 0.1, 0.1);
    this.camera2.setZoom(1);
    this.camera2.setBounds(0, 0, width, height);

    // 添加分割线
    const divider = this.add.graphics();
    divider.fillStyle(0xffffff, 1);
    divider.fillRect(width / 2 - 2, 0, 4, height);
    divider.setScrollFactor(0);
    divider.setDepth(1000);
  }

  createUI() {
    const width = this.cameras.main.width;
    
    // 玩家1信息（显示在左屏）
    this.text1 = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#0088ff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.text1.setScrollFactor(0);
    this.text1.setDepth(1001);
    this.cameras.main.ignore(this.text1);
    this.camera2.ignore(this.text1);

    // 玩家2信息（显示在右屏）
    this.text2 = this.add.text(width / 2 + 10, 10, '', {
      fontSize: '16px',
      color: '#ff0044',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.text2.setScrollFactor(0);
    this.text2.setDepth(1001);

    // 碰撞计数显示（两屏都显示）
    this.collisionText = this.add.text(10, 40, '', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.collisionText.setScrollFactor(0);
    this.collisionText.setDepth(1001);
  }

  update(time, delta) {
    const speed = 240;

    // 玩家1移动控制（WASD）
    this.player1.setVelocity(0);
    
    if (this.keys1.left.isDown) {
      this.player1.setVelocityX(-speed);
    } else if (this.keys1.right.isDown) {
      this.player1.setVelocityX(speed);
    }

    if (this.keys1.up.isDown) {
      this.player1.setVelocityY(-speed);
    } else if (this.keys1.down.isDown) {
      this.player1.setVelocityY(speed);
    }

    // 玩家2移动控制（方向键）
    this.player2.setVelocity(0);
    
    if (this.keys2.left.isDown) {
      this.player2.setVelocityX(-speed);
    } else if (this.keys2.right.isDown) {
      this.player2.setVelocityX(speed);
    }

    if (this.keys2.up.isDown) {
      this.player2.setVelocityY(-speed);
    } else if (this.keys2.down.isDown) {
      this.player2.setVelocityY(speed);
    }

    // 归一化对角线速度
    if (this.player1.body.velocity.x !== 0 && this.player1.body.velocity.y !== 0) {
      this.player1.body.velocity.normalize().scale(speed);
    }
    if (this.player2.body.velocity.x !== 0 && this.player2.body.velocity.y !== 0) {
      this.player2.body.velocity.normalize().scale(speed);
    }

    // 更新UI
    this.text1.setText([
      'Player 1 (WASD)',
      `Pos: (${Math.floor(this.player1.x)}, ${Math.floor(this.player1.y)})`,
      `Vel: ${Math.floor(this.player1.body.velocity.length())}`
    ]);

    this.text2.setText([
      'Player 2 (Arrows)',
      `Pos: (${Math.floor(this.player2.x)}, ${Math.floor(this.player2.y)})`,
      `Vel: ${Math.floor(this.player2.body.velocity.length())}`
    ]);

    this.collisionText.setText(`Collisions: ${this.collisionCount}`);

    // 状态信号输出（用于验证）
    if (time % 1000 < 16) { // 大约每秒输出一次
      console.log('Game State:', {
        player1: { x: this.player1.x, y: this.player1.y },
        player2: { x: this.player2.x, y: this.player2.y },
        collisions: this.collisionCount
      });
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 600,
  backgroundColor: '#1a1a1a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: SplitScreenGame
};

new Phaser.Game(config);