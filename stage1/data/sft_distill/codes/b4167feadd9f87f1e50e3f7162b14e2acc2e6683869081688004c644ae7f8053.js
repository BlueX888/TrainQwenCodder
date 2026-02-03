class MinimapScene extends Phaser.Scene {
  constructor() {
    super('MinimapScene');
    this.playerSpeed = 300;
    this.worldWidth = 1600;
    this.worldHeight = 1200;
    this.minimapWidth = 200;
    this.minimapHeight = 150;
    this.playerX = 0;
    this.playerY = 0;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 24, 24);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 创建宝箱纹理
    const chestGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    chestGraphics.fillStyle(0xffaa00, 1);
    chestGraphics.fillRect(0, 0, 20, 20);
    chestGraphics.generateTexture('chest', 20, 20);
    chestGraphics.destroy();
  }

  create() {
    // 设置世界边界
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // 绘制地图背景（网格）
    this.drawMapBackground();

    // 创建一些静态对象（敌人和宝箱）
    this.createStaticObjects();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 设置主相机跟随玩家
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);

    // 创建小地图相机
    this.createMinimap();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 创建小地图上的玩家指示器
    this.minimapPlayerIndicator = this.add.graphics();
    this.minimapPlayerIndicator.setScrollFactor(0);
    this.minimapPlayerIndicator.setDepth(1000);

    // 添加小地图边框
    this.minimapBorder = this.add.graphics();
    this.minimapBorder.lineStyle(2, 0xffffff, 1);
    this.minimapBorder.strokeRect(
      this.cameras.main.width - this.minimapWidth - 10,
      10,
      this.minimapWidth,
      this.minimapHeight
    );
    this.minimapBorder.setScrollFactor(0);
    this.minimapBorder.setDepth(999);

    // 状态变量（用于验证）
    this.score = 0;
    this.health = 100;
    this.level = 1;

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 5, y: 5 }
    });
    this.statusText.setScrollFactor(0);
    this.statusText.setDepth(1001);
  }

  drawMapBackground() {
    const graphics = this.add.graphics();
    
    // 绘制背景
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, this.worldWidth, this.worldHeight);

    // 绘制网格
    graphics.lineStyle(1, 0x333344, 0.5);
    const gridSize = 100;
    
    for (let x = 0; x <= this.worldWidth; x += gridSize) {
      graphics.lineBetween(x, 0, x, this.worldHeight);
    }
    
    for (let y = 0; y <= this.worldHeight; y += gridSize) {
      graphics.lineBetween(0, y, this.worldWidth, y);
    }

    // 绘制边界
    graphics.lineStyle(4, 0xffffff, 1);
    graphics.strokeRect(0, 0, this.worldWidth, this.worldHeight);
  }

  createStaticObjects() {
    // 使用固定种子创建确定性的对象位置
    const positions = [
      { x: 200, y: 200, type: 'enemy' },
      { x: 800, y: 400, type: 'chest' },
      { x: 1200, y: 300, type: 'enemy' },
      { x: 400, y: 800, type: 'chest' },
      { x: 1400, y: 900, type: 'enemy' },
      { x: 600, y: 600, type: 'chest' },
      { x: 1000, y: 1000, type: 'enemy' },
      { x: 300, y: 500, type: 'chest' }
    ];

    positions.forEach(pos => {
      this.add.sprite(pos.x, pos.y, pos.type);
    });
  }

  createMinimap() {
    // 创建小地图相机
    const minimapX = this.cameras.main.width - this.minimapWidth - 10;
    const minimapY = 10;

    this.minimap = this.cameras.add(
      minimapX,
      minimapY,
      this.minimapWidth,
      this.minimapHeight
    );

    // 设置小地图显示整个世界
    this.minimap.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.minimap.setZoom(this.minimapWidth / this.worldWidth);
    this.minimap.setBackgroundColor(0x000000);
    
    // 小地图不跟随，显示全局视角
    this.minimap.scrollX = 0;
    this.minimap.scrollY = 0;

    // 忽略某些对象（如UI元素）
    this.minimap.ignore([this.minimapBorder]);
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);

    // 处理玩家移动
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.keys.a.isDown) {
      velocityX = -this.playerSpeed;
    } else if (this.cursors.right.isDown || this.keys.d.isDown) {
      velocityX = this.playerSpeed;
    }

    if (this.cursors.up.isDown || this.keys.w.isDown) {
      velocityY = -this.playerSpeed;
    } else if (this.cursors.down.isDown || this.keys.s.isDown) {
      velocityY = this.playerSpeed;
    }

    // 对角线移动时归一化速度
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }

    this.player.setVelocity(velocityX, velocityY);

    // 更新玩家位置状态
    this.playerX = Math.floor(this.player.x);
    this.playerY = Math.floor(this.player.y);

    // 更新小地图玩家指示器
    this.updateMinimapIndicator();

    // 更新状态文本
    this.statusText.setText([
      `Position: (${this.playerX}, ${this.playerY})`,
      `Score: ${this.score}`,
      `Health: ${this.health}`,
      `Level: ${this.level}`
    ]);
  }

  updateMinimapIndicator() {
    // 清除之前的绘制
    this.minimapPlayerIndicator.clear();

    // 计算玩家在小地图上的位置
    const minimapX = this.cameras.main.width - this.minimapWidth - 10;
    const minimapY = 10;
    const scaleX = this.minimapWidth / this.worldWidth;
    const scaleY = this.minimapHeight / this.worldHeight;

    const indicatorX = minimapX + this.player.x * scaleX;
    const indicatorY = minimapY + this.player.y * scaleY;

    // 绘制玩家指示器（白色圆点）
    this.minimapPlayerIndicator.fillStyle(0xffffff, 1);
    this.minimapPlayerIndicator.fillCircle(indicatorX, indicatorY, 3);

    // 绘制玩家视野范围
    const viewWidth = this.cameras.main.width * scaleX;
    const viewHeight = this.cameras.main.height * scaleY;
    
    this.minimapPlayerIndicator.lineStyle(1, 0x00ff00, 0.5);
    this.minimapPlayerIndicator.strokeRect(
      indicatorX - viewWidth / 2,
      indicatorY - viewHeight / 2,
      viewWidth,
      viewHeight
    );
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: MinimapScene
};

new Phaser.Game(config);