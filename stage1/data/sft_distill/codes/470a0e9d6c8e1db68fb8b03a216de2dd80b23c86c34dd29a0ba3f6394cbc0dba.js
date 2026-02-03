class SplitScreenScene extends Phaser.Scene {
  constructor() {
    super('SplitScreenScene');
    this.player1CollisionCount = 0;
    this.player2CollisionCount = 0;
    this.totalCollisions = 0;
  }

  preload() {
    // 使用Graphics生成玩家纹理
    this.createPlayerTextures();
  }

  createPlayerTextures() {
    // 创建玩家1纹理（蓝色方块）
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0x0066ff, 1);
    graphics1.fillRect(0, 0, 32, 32);
    graphics1.lineStyle(2, 0x003399, 1);
    graphics1.strokeRect(0, 0, 32, 32);
    graphics1.generateTexture('player1', 32, 32);
    graphics1.destroy();

    // 创建玩家2纹理（红色方块）
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xff3333, 1);
    graphics2.fillRect(0, 0, 32, 32);
    graphics2.lineStyle(2, 0x990000, 1);
    graphics2.strokeRect(0, 0, 32, 32);
    graphics2.generateTexture('player2', 32, 32);
    graphics2.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x33cc33, 1);
    groundGraphics.fillRect(0, 0, 64, 64);
    groundGraphics.lineStyle(1, 0x228822, 1);
    for (let i = 0; i < 64; i += 8) {
      groundGraphics.lineBetween(i, 0, i, 64);
      groundGraphics.lineBetween(0, i, 64, i);
    }
    groundGraphics.generateTexture('ground', 64, 64);
    groundGraphics.destroy();
  }

  create() {
    const worldWidth = 1600;
    const worldHeight = 600;

    // 设置世界边界
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // 创建地面平台
    this.createPlatforms(worldWidth, worldHeight);

    // 创建玩家1（左侧出生）
    this.player1 = this.physics.add.sprite(200, 300, 'player1');
    this.player1.setBounce(0.3);
    this.player1.setCollideWorldBounds(true);
    this.player1.setMass(1);

    // 创建玩家2（右侧出生）
    this.player2 = this.physics.add.sprite(worldWidth - 200, 300, 'player2');
    this.player2.setBounce(0.3);
    this.player2.setCollideWorldBounds(true);
    this.player2.setMass(1);

    // 玩家与平台碰撞
    this.physics.add.collider(this.player1, this.platforms);
    this.physics.add.collider(this.player2, this.platforms);

    // 玩家之间碰撞，设置弹性
    this.physics.add.collider(this.player1, this.player2, this.handlePlayerCollision, null, this);

    // 创建键盘控制
    // 玩家1使用WASD
    this.keys1 = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 玩家2使用方向键
    this.keys2 = this.input.keyboard.createCursorKeys();

    // 创建分屏摄像机
    this.setupCameras(worldWidth, worldHeight);

    // 创建UI文本
    this.createUI();
  }

  createPlatforms(worldWidth, worldHeight) {
    this.platforms = this.physics.add.staticGroup();

    // 底部地面
    for (let x = 0; x < worldWidth; x += 64) {
      this.platforms.create(x + 32, worldHeight - 32, 'ground');
    }

    // 中间平台
    this.platforms.create(400, 450, 'ground');
    this.platforms.create(worldWidth - 400, 450, 'ground');
    this.platforms.create(worldWidth / 2, 350, 'ground');
  }

  setupCameras(worldWidth, worldHeight) {
    // 获取主摄像机（玩家1）
    const cam1 = this.cameras.main;
    cam1.setBounds(0, 0, worldWidth, worldHeight);
    cam1.setViewport(0, 0, 400, 600); // 左半屏
    cam1.startFollow(this.player1, true, 0.1, 0.1);
    cam1.setBackgroundColor(0x1a1a2e);

    // 创建第二个摄像机（玩家2）
    const cam2 = this.cameras.add(400, 0, 400, 600);
    cam2.setBounds(0, 0, worldWidth, worldHeight);
    cam2.startFollow(this.player2, true, 0.1, 0.1);
    cam2.setBackgroundColor(0x2e1a1a);

    // 添加分隔线
    const separator = this.add.graphics();
    separator.fillStyle(0xffffff, 1);
    separator.fillRect(398, 0, 4, 600);
    separator.setScrollFactor(0);
    separator.setDepth(1000);
  }

  createUI() {
    // 玩家1 UI（固定在左侧摄像机）
    this.ui1Text = this.add.text(10, 10, 'Player 1 (WASD)\nCollisions: 0', {
      fontSize: '16px',
      fill: '#0066ff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.ui1Text.setScrollFactor(0);
    this.ui1Text.setDepth(1000);

    // 玩家2 UI（固定在右侧摄像机）
    this.ui2Text = this.add.text(410, 10, 'Player 2 (Arrows)\nCollisions: 0', {
      fontSize: '16px',
      fill: '#ff3333',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.ui2Text.setScrollFactor(0);
    this.ui2Text.setDepth(1000);

    // 总碰撞计数（居中）
    this.totalText = this.add.text(400, 10, 'Total: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.totalText.setOrigin(0.5, 0);
    this.totalText.setScrollFactor(0);
    this.totalText.setDepth(1000);
  }

  handlePlayerCollision(player1, player2) {
    // 增加碰撞计数
    this.player1CollisionCount++;
    this.player2CollisionCount++;
    this.totalCollisions++;

    // 计算碰撞方向并施加额外的弹开力
    const dx = player2.x - player1.x;
    const dy = player2.y - player1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      const force = 200;
      const normalX = dx / distance;
      const normalY = dy / distance;
      
      player1.setVelocityX(player1.body.velocity.x - normalX * force);
      player1.setVelocityY(player1.body.velocity.y - normalY * force);
      
      player2.setVelocityX(player2.body.velocity.x + normalX * force);
      player2.setVelocityY(player2.body.velocity.y + normalY * force);
    }

    // 更新UI
    this.updateUI();
  }

  updateUI() {
    this.ui1Text.setText(`Player 1 (WASD)\nCollisions: ${this.player1CollisionCount}\nPos: ${Math.floor(this.player1.x)}, ${Math.floor(this.player1.y)}`);
    this.ui2Text.setText(`Player 2 (Arrows)\nCollisions: ${this.player2CollisionCount}\nPos: ${Math.floor(this.player2.x)}, ${Math.floor(this.player2.y)}`);
    this.totalText.setText(`Total Collisions: ${this.totalCollisions}`);
  }

  update(time, delta) {
    const speed = 240;

    // 玩家1控制（WASD）
    if (this.keys1.left.isDown) {
      this.player1.setVelocityX(-speed);
    } else if (this.keys1.right.isDown) {
      this.player1.setVelocityX(speed);
    } else {
      this.player1.setVelocityX(0);
    }

    if (this.keys1.up.isDown && this.player1.body.touching.down) {
      this.player1.setVelocityY(-400);
    }

    // 玩家2控制（方向键）
    if (this.keys2.left.isDown) {
      this.player2.setVelocityX(-speed);
    } else if (this.keys2.right.isDown) {
      this.player2.setVelocityX(speed);
    } else {
      this.player2.setVelocityX(0);
    }

    if (this.keys2.up.isDown && this.player2.body.touching.down) {
      this.player2.setVelocityY(-400);
    }

    // 每帧更新UI显示位置
    if (time % 100 < delta) {
      this.updateUI();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: SplitScreenScene
};

new Phaser.Game(config);