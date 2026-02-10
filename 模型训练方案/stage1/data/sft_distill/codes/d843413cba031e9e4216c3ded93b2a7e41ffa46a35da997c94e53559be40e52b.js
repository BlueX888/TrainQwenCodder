class SplitScreenScene extends Phaser.Scene {
  constructor() {
    super('SplitScreenScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
    this.player1Score = 0;
    this.player2Score = 0;
  }

  preload() {
    // 使用 Graphics 生成玩家纹理
    this.createPlayerTextures();
  }

  createPlayerTextures() {
    // 创建玩家1纹理（蓝色方块）
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0x0088ff, 1);
    graphics1.fillRect(0, 0, 32, 32);
    graphics1.lineStyle(2, 0x0044aa, 1);
    graphics1.strokeRect(0, 0, 32, 32);
    graphics1.generateTexture('player1', 32, 32);
    graphics1.destroy();

    // 创建玩家2纹理（红色方块）
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xff4444, 1);
    graphics2.fillRect(0, 0, 32, 32);
    graphics2.lineStyle(2, 0xaa0000, 1);
    graphics2.strokeRect(0, 0, 32, 32);
    graphics2.generateTexture('player2', 32, 32);
    graphics2.destroy();

    // 创建边界纹理
    const boundaryGraphics = this.add.graphics();
    boundaryGraphics.fillStyle(0x444444, 1);
    boundaryGraphics.fillRect(0, 0, 20, 20);
    boundaryGraphics.generateTexture('boundary', 20, 20);
    boundaryGraphics.destroy();
  }

  create() {
    const worldWidth = 1600;
    const worldHeight = 600;

    // 设置世界边界
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // 创建背景区分
    const bg1 = this.add.rectangle(worldWidth / 4, worldHeight / 2, worldWidth / 2, worldHeight, 0x1a1a2e);
    const bg2 = this.add.rectangle(worldWidth * 3 / 4, worldHeight / 2, worldWidth / 2, worldHeight, 0x2e1a1a);

    // 创建中线
    const centerLine = this.add.graphics();
    centerLine.lineStyle(4, 0xffffff, 0.3);
    centerLine.lineBetween(worldWidth / 2, 0, worldWidth / 2, worldHeight);

    // 创建边界墙（可选，增加游戏趣味性）
    this.createBoundaryWalls(worldWidth, worldHeight);

    // 创建玩家1（左侧区域）
    this.player1 = this.physics.add.sprite(worldWidth / 4, worldHeight / 2, 'player1');
    this.player1.setCollideWorldBounds(true);
    this.player1.setBounce(0.8); // 设置弹性
    this.player1.setMaxVelocity(80, 80); // 限制最大速度

    // 创建玩家2（右侧区域）
    this.player2 = this.physics.add.sprite(worldWidth * 3 / 4, worldHeight / 2, 'player2');
    this.player2.setCollideWorldBounds(true);
    this.player2.setBounce(0.8); // 设置弹性
    this.player2.setMaxVelocity(80, 80); // 限制最大速度

    // 添加玩家碰撞检测
    this.physics.add.collider(this.player1, this.player2, this.handlePlayerCollision, null, this);

    // 如果有边界墙，添加碰撞
    if (this.boundaryGroup) {
      this.physics.add.collider(this.player1, this.boundaryGroup);
      this.physics.add.collider(this.player2, this.boundaryGroup);
    }

    // 设置键盘输入
    // 玩家1使用 WASD
    this.keys1 = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 玩家2使用方向键
    this.keys2 = this.input.keyboard.createCursorKeys();

    // 设置分屏摄像机
    this.setupSplitScreenCameras(worldWidth, worldHeight);

    // 创建UI文本显示
    this.createUI();
  }

  createBoundaryWalls(worldWidth, worldHeight) {
    this.boundaryGroup = this.physics.add.staticGroup();

    // 顶部和底部墙
    for (let x = 0; x < worldWidth; x += 20) {
      this.boundaryGroup.create(x, 10, 'boundary');
      this.boundaryGroup.create(x, worldHeight - 10, 'boundary');
    }

    // 左右墙
    for (let y = 0; y < worldHeight; y += 20) {
      this.boundaryGroup.create(10, y, 'boundary');
      this.boundaryGroup.create(worldWidth - 10, y, 'boundary');
    }
  }

  setupSplitScreenCameras(worldWidth, worldHeight) {
    // 移除默认摄像机
    this.cameras.main.setViewport(0, 0, 400, 600);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player1, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);

    // 创建第二个摄像机（右侧）
    const camera2 = this.cameras.add(400, 0, 400, 600);
    camera2.setBounds(0, 0, worldWidth, worldHeight);
    camera2.startFollow(this.player2, true, 0.1, 0.1);
    camera2.setZoom(1);

    // 添加摄像机边界视觉效果
    const divider = this.add.graphics();
    divider.fillStyle(0xffffff, 1);
    divider.fillRect(398, 0, 4, 600);
    divider.setScrollFactor(0);
    divider.setDepth(1000);
  }

  createUI() {
    // 玩家1信息（左上角）
    this.player1Text = this.add.text(10, 10, 'Player 1 (WASD)\nPos: 0, 0\nScore: 0', {
      fontSize: '14px',
      fill: '#0088ff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.player1Text.setScrollFactor(0);
    this.player1Text.setDepth(1000);

    // 玩家2信息（右上角）
    this.player2Text = this.add.text(410, 10, 'Player 2 (Arrows)\nPos: 0, 0\nScore: 0', {
      fontSize: '14px',
      fill: '#ff4444',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.player2Text.setScrollFactor(0);
    this.player2Text.setDepth(1000);

    // 碰撞计数（中央）
    this.collisionText = this.add.text(400, 10, 'Collisions: 0', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.collisionText.setOrigin(0.5, 0);
    this.collisionText.setScrollFactor(0);
    this.collisionText.setDepth(1000);
  }

  handlePlayerCollision(player1, player2) {
    // 碰撞计数
    this.collisionCount++;

    // 计算碰撞方向并施加弹开力
    const angle = Phaser.Math.Angle.Between(
      player1.x, player1.y,
      player2.x, player2.y
    );

    const force = 200;
    
    // 玩家1向反方向弹开
    player1.setVelocity(
      Math.cos(angle + Math.PI) * force,
      Math.sin(angle + Math.PI) * force
    );

    // 玩家2向碰撞方向弹开
    player2.setVelocity(
      Math.cos(angle) * force,
      Math.sin(angle) * force
    );

    // 更新分数（可选）
    this.player1Score++;
    this.player2Score++;
  }

  update(time, delta) {
    // 玩家1移动控制（WASD）
    const speed = 80;
    
    if (this.keys1.left.isDown) {
      this.player1.setVelocityX(-speed);
    } else if (this.keys1.right.isDown) {
      this.player1.setVelocityX(speed);
    } else {
      this.player1.setVelocityX(0);
    }

    if (this.keys1.up.isDown) {
      this.player1.setVelocityY(-speed);
    } else if (this.keys1.down.isDown) {
      this.player1.setVelocityY(speed);
    } else {
      this.player1.setVelocityY(0);
    }

    // 玩家2移动控制（方向键）
    if (this.keys2.left.isDown) {
      this.player2.setVelocityX(-speed);
    } else if (this.keys2.right.isDown) {
      this.player2.setVelocityX(speed);
    } else {
      this.player2.setVelocityX(0);
    }

    if (this.keys2.up.isDown) {
      this.player2.setVelocityY(-speed);
    } else if (this.keys2.down.isDown) {
      this.player2.setVelocityY(speed);
    } else {
      this.player2.setVelocityY(0);
    }

    // 更新UI
    this.player1Text.setText(
      `Player 1 (WASD)\nPos: ${Math.round(this.player1.x)}, ${Math.round(this.player1.y)}\nScore: ${this.player1Score}`
    );

    this.player2Text.setText(
      `Player 2 (Arrows)\nPos: ${Math.round(this.player2.x)}, ${Math.round(this.player2.y)}\nScore: ${this.player2Score}`
    );

    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: SplitScreenScene
};

// 启动游戏
const game = new Phaser.Game(config);