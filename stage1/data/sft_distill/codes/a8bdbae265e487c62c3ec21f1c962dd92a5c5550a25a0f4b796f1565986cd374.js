class MiniMapScene extends Phaser.Scene {
  constructor() {
    super('MiniMapScene');
    this.playerSpeed = 160;
    this.score = 0;
    this.health = 100;
    this.enemiesDefeated = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const worldWidth = 2000;
    const worldHeight = 1500;
    
    // 设置世界边界
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    
    // 创建背景网格
    this.createBackground(worldWidth, worldHeight);
    
    // 程序化生成玩家纹理
    this.createPlayerTexture();
    
    // 程序化生成敌人纹理
    this.createEnemyTexture();
    
    // 程序化生成障碍物纹理
    this.createObstacleTexture();
    
    // 创建玩家
    this.player = this.physics.add.sprite(worldWidth / 2, worldHeight / 2, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 创建障碍物组
    this.obstacles = this.physics.add.staticGroup();
    this.createObstacles(worldWidth, worldHeight);
    
    // 创建敌人组
    this.enemies = this.physics.add.group();
    this.createEnemies(worldWidth, worldHeight);
    
    // 设置碰撞
    this.physics.add.collider(this.player, this.obstacles);
    this.physics.add.overlap(this.player, this.enemies, this.collectEnemy, null, this);
    
    // 配置主相机跟随玩家
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    
    // 创建小地图相机
    this.createMiniMap(worldWidth, worldHeight);
    
    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 显示状态信息
    this.createStatusText();
    
    // 在小地图上绘制边框
    this.miniMapBorder = this.add.graphics();
    this.miniMapBorder.lineStyle(2, 0xffffff, 1);
    this.miniMapBorder.strokeRect(598, 8, 194, 144);
    this.miniMapBorder.setScrollFactor(0);
    this.miniMapBorder.setDepth(1000);
  }

  createBackground(width, height) {
    const graphics = this.add.graphics();
    
    // 填充背景色
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, width, height);
    
    // 绘制网格
    graphics.lineStyle(1, 0x16213e, 0.5);
    const gridSize = 100;
    
    for (let x = 0; x <= width; x += gridSize) {
      graphics.lineBetween(x, 0, x, height);
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      graphics.lineBetween(0, y, width, y);
    }
    
    // 绘制世界边界
    graphics.lineStyle(4, 0x0f3460, 1);
    graphics.strokeRect(0, 0, width, height);
  }

  createPlayerTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 12);
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeCircle(16, 16, 12);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  createEnemyTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(12, 12, 8);
    graphics.lineStyle(1, 0xffff00, 1);
    graphics.strokeCircle(12, 12, 8);
    graphics.generateTexture('enemy', 24, 24);
    graphics.destroy();
  }

  createObstacleTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(0, 0, 60, 60);
    graphics.lineStyle(2, 0x654321, 1);
    graphics.strokeRect(0, 0, 60, 60);
    graphics.generateTexture('obstacle', 60, 60);
    graphics.destroy();
  }

  createObstacles(worldWidth, worldHeight) {
    // 使用固定种子创建障碍物
    const positions = [
      { x: 300, y: 300 },
      { x: 800, y: 400 },
      { x: 1500, y: 600 },
      { x: 600, y: 900 },
      { x: 1200, y: 1100 },
      { x: 400, y: 1200 },
      { x: 1600, y: 300 },
      { x: 1000, y: 800 }
    ];
    
    positions.forEach(pos => {
      const obstacle = this.obstacles.create(pos.x, pos.y, 'obstacle');
      obstacle.setOrigin(0.5, 0.5);
    });
  }

  createEnemies(worldWidth, worldHeight) {
    // 使用固定位置创建敌人
    const positions = [
      { x: 500, y: 500 },
      { x: 1200, y: 400 },
      { x: 700, y: 1000 },
      { x: 1500, y: 800 },
      { x: 300, y: 700 },
      { x: 1700, y: 1200 },
      { x: 900, y: 300 },
      { x: 1400, y: 1300 }
    ];
    
    positions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setOrigin(0.5, 0.5);
    });
  }

  createMiniMap(worldWidth, worldHeight) {
    // 创建小地图相机
    const miniMapWidth = 200;
    const miniMapHeight = 150;
    const miniMapX = 800 - miniMapWidth - 10; // 右上角
    const miniMapY = 10;
    
    this.miniMap = this.cameras.add(miniMapX, miniMapY, miniMapWidth, miniMapHeight);
    this.miniMap.setBounds(0, 0, worldWidth, worldHeight);
    this.miniMap.setZoom(0.1); // 缩小显示全局视图
    this.miniMap.setBackgroundColor(0x000000);
    
    // 小地图也跟随玩家，但显示更大范围
    this.miniMap.startFollow(this.player, true, 0.1, 0.1);
    
    // 设置小地图的渲染顺序
    this.miniMap.setScroll(0, 0);
  }

  createStatusText() {
    // 创建状态显示文本（固定在屏幕上）
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0);
    this.statusText.setDepth(1000);
    
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `Score: ${this.score}`,
      `Health: ${this.health}`,
      `Enemies Defeated: ${this.enemiesDefeated}`,
      `Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
    ]);
  }

  collectEnemy(player, enemy) {
    enemy.destroy();
    this.score += 10;
    this.enemiesDefeated += 1;
    this.updateStatusText();
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);
    
    // 键盘控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }
    
    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }
    
    // 更新状态文本
    this.updateStatusText();
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
  scene: MiniMapScene
};

new Phaser.Game(config);