class MiniMapScene extends Phaser.Scene {
  constructor() {
    super('MiniMapScene');
    this.player = null;
    this.enemies = [];
    this.cursors = null;
    this.mainCamera = null;
    this.miniMapCamera = null;
    this.playerSpeed = 160;
    // 状态信号
    this.score = 0;
    this.health = 100;
    this.level = 1;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置世界边界
    const worldWidth = 2000;
    const worldHeight = 1500;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // 绘制背景网格和地面
    this.createBackground(worldWidth, worldHeight);

    // 创建玩家纹理
    this.createPlayerTexture();
    
    // 创建敌人纹理
    this.createEnemyTexture();

    // 创建障碍物
    this.createObstacles(worldWidth, worldHeight);

    // 创建玩家
    this.player = this.physics.add.sprite(worldWidth / 2, worldHeight / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(28, 28);

    // 创建多个敌人作为参考点
    this.createEnemies(worldWidth, worldHeight);

    // 设置主相机跟随玩家
    this.mainCamera = this.cameras.main;
    this.mainCamera.setBounds(0, 0, worldWidth, worldHeight);
    this.mainCamera.startFollow(this.player, true, 0.1, 0.1);
    this.mainCamera.setZoom(1);

    // 创建小地图相机
    const miniMapWidth = 200;
    const miniMapHeight = 150;
    const padding = 10;
    
    this.miniMapCamera = this.cameras.add(
      this.cameras.main.width - miniMapWidth - padding,
      padding,
      miniMapWidth,
      miniMapHeight
    );
    
    // 设置小地图相机属性
    this.miniMapCamera.setBounds(0, 0, worldWidth, worldHeight);
    this.miniMapCamera.setZoom(miniMapWidth / worldWidth); // 缩放以显示整个世界
    this.miniMapCamera.setBackgroundColor(0x000000);
    this.miniMapCamera.scrollX = 0;
    this.miniMapCamera.scrollY = 0;
    
    // 让小地图显示整个世界的中心
    this.miniMapCamera.centerOn(worldWidth / 2, worldHeight / 2);

    // 绘制小地图边框
    this.createMiniMapBorder(miniMapWidth, miniMapHeight, padding);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.statusText.setScrollFactor(0);
    this.statusText.setDepth(1000);

    // 添加小地图标签
    this.miniMapLabel = this.add.text(
      this.cameras.main.width - miniMapWidth - padding + 5,
      padding + 5,
      'Mini Map',
      {
        fontSize: '12px',
        fill: '#00ff00',
        backgroundColor: '#000000'
      }
    );
    this.miniMapLabel.setScrollFactor(0);
    this.miniMapLabel.setDepth(1001);

    console.log('Game initialized - Player at center, use arrow keys to move');
  }

  createBackground(width, height) {
    const graphics = this.add.graphics();
    
    // 绘制地面
    graphics.fillStyle(0x228B22, 1);
    graphics.fillRect(0, 0, width, height);
    
    // 绘制网格
    graphics.lineStyle(1, 0x1a6b1a, 0.3);
    const gridSize = 100;
    
    for (let x = 0; x <= width; x += gridSize) {
      graphics.lineBetween(x, 0, x, height);
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      graphics.lineBetween(0, y, width, y);
    }
  }

  createPlayerTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillRect(0, 0, 32, 32);
    
    // 添加方向指示器
    graphics.fillStyle(0xffffff, 1);
    graphics.fillTriangle(16, 8, 10, 16, 22, 16);
    
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  createEnemyTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 24, 24);
    
    // 添加X标记
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.lineBetween(6, 6, 18, 18);
    graphics.lineBetween(18, 6, 6, 18);
    
    graphics.generateTexture('enemy', 24, 24);
    graphics.destroy();
  }

  createObstacles(worldWidth, worldHeight) {
    const graphics = this.add.graphics();
    
    // 创建一些障碍物作为地图参考
    const obstacles = [
      { x: 300, y: 300, w: 100, h: 100, color: 0x8B4513 },
      { x: 1500, y: 400, w: 150, h: 80, color: 0x8B4513 },
      { x: 800, y: 1000, w: 120, h: 120, color: 0x8B4513 },
      { x: 200, y: 1200, w: 80, h: 150, color: 0x8B4513 },
      { x: 1700, y: 1100, w: 100, h: 100, color: 0x8B4513 }
    ];

    obstacles.forEach(obs => {
      graphics.fillStyle(obs.color, 1);
      graphics.fillRect(obs.x, obs.y, obs.w, obs.h);
      
      // 添加边框
      graphics.lineStyle(2, 0x654321, 1);
      graphics.strokeRect(obs.x, obs.y, obs.w, obs.h);
    });
  }

  createEnemies(worldWidth, worldHeight) {
    // 使用固定位置创建敌人（确定性）
    const enemyPositions = [
      { x: 500, y: 500 },
      { x: 1500, y: 500 },
      { x: 500, y: 1000 },
      { x: 1500, y: 1000 },
      { x: 1000, y: 250 },
      { x: 1000, y: 1250 },
      { x: 250, y: 750 },
      { x: 1750, y: 750 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.physics.add.sprite(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      
      // 简单的巡逻行为
      enemy.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
      
      this.enemies.push(enemy);
    });
  }

  createMiniMapBorder(width, height, padding) {
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(3, 0x00ff00, 1);
    borderGraphics.strokeRect(
      this.cameras.main.width - width - padding,
      padding,
      width,
      height
    );
    borderGraphics.setScrollFactor(0);
    borderGraphics.setDepth(1000);
  }

  update(time, delta) {
    // 玩家移动控制
    if (this.player) {
      this.player.setVelocity(0);

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

      // 对角线移动时标准化速度
      if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
        this.player.body.velocity.normalize().scale(this.playerSpeed);
      }

      // 更新玩家角度
      if (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0) {
        this.player.rotation = Math.atan2(this.player.body.velocity.y, this.player.body.velocity.x) + Math.PI / 2;
      }
    }

    // 敌人简单AI - 边界反弹
    this.enemies.forEach(enemy => {
      if (enemy.x <= 50 || enemy.x >= this.physics.world.bounds.width - 50) {
        enemy.body.velocity.x *= -1;
      }
      if (enemy.y <= 50 || enemy.y >= this.physics.world.bounds.height - 50) {
        enemy.body.velocity.y *= -1;
      }
    });

    // 更新状态显示
    this.updateStatus();
  }

  updateStatus() {
    const px = Math.floor(this.player.x);
    const py = Math.floor(this.player.y);
    const speed = Math.floor(Math.sqrt(
      this.player.body.velocity.x ** 2 + this.player.body.velocity.y ** 2
    ));

    this.statusText.setText([
      `Level: ${this.level}`,
      `Health: ${this.health}`,
      `Score: ${this.score}`,
      `Position: (${px}, ${py})`,
      `Speed: ${speed}`,
      `Enemies: ${this.enemies.length}`
    ]);
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