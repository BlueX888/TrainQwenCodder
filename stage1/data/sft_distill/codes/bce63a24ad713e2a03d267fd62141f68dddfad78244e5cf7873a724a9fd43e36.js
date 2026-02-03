class MiniMapScene extends Phaser.Scene {
  constructor() {
    super('MiniMapScene');
    this.playerSpeed = 360;
    this.worldWidth = 2000;
    this.worldHeight = 1500;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 状态信号
    this.playerX = 0;
    this.playerY = 0;
    this.cameraCount = 0;

    // 创建世界背景网格
    this.createWorldBackground();

    // 创建一些障碍物作为参照物
    this.createObstacles();

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(this.worldWidth / 2, this.worldHeight / 2, 'player');
    this.player.setCollideWorldBounds(true);

    // 设置世界边界
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // 配置主相机
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    this.cameraCount++;

    // 创建小地图相机
    this.createMiniMap();

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文字（只在主相机显示）
    const instructions = this.add.text(10, 10, 'Use Arrow Keys to Move\nSpeed: 360', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    instructions.setScrollFactor(0);
    instructions.setDepth(100);
    
    // 确保说明文字不在小地图显示
    this.miniMapCamera.ignore(instructions);
  }

  createWorldBackground() {
    const graphics = this.add.graphics();
    
    // 绘制背景
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, this.worldWidth, this.worldHeight);

    // 绘制网格
    graphics.lineStyle(1, 0x2a2a4e, 0.5);
    const gridSize = 100;
    
    for (let x = 0; x <= this.worldWidth; x += gridSize) {
      graphics.lineBetween(x, 0, x, this.worldHeight);
    }
    
    for (let y = 0; y <= this.worldHeight; y += gridSize) {
      graphics.lineBetween(0, y, this.worldWidth, y);
    }

    // 绘制边界
    graphics.lineStyle(4, 0xff0000, 1);
    graphics.strokeRect(2, 2, this.worldWidth - 4, this.worldHeight - 4);
  }

  createObstacles() {
    // 创建一些固定位置的障碍物作为参照
    const obstacles = [
      { x: 300, y: 300, width: 100, height: 100, color: 0xff6b6b },
      { x: 1500, y: 400, width: 150, height: 80, color: 0x4ecdc4 },
      { x: 800, y: 1000, width: 120, height: 120, color: 0xffe66d },
      { x: 1600, y: 1200, width: 100, height: 150, color: 0x95e1d3 },
      { x: 400, y: 1100, width: 80, height: 80, color: 0xf38181 }
    ];

    obstacles.forEach(obs => {
      const graphics = this.add.graphics();
      graphics.fillStyle(obs.color, 1);
      graphics.fillRect(obs.x, obs.y, obs.width, obs.height);
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeRect(obs.x, obs.y, obs.width, obs.height);
    });
  }

  createMiniMap() {
    // 小地图尺寸
    const miniMapWidth = 200;
    const miniMapHeight = 150;
    const padding = 10;

    // 计算小地图位置（右上角）
    const miniMapX = this.cameras.main.width - miniMapWidth - padding;
    const miniMapY = padding;

    // 创建小地图相机
    this.miniMapCamera = this.cameras.add(
      miniMapX,
      miniMapY,
      miniMapWidth,
      miniMapHeight
    );

    // 设置小地图相机属性
    this.miniMapCamera.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.miniMapCamera.setZoom(Math.min(miniMapWidth / this.worldWidth, miniMapHeight / this.worldHeight));
    this.miniMapCamera.setBackgroundColor(0x000000);
    this.cameraCount++;

    // 创建小地图边框（使用 Graphics，固定在屏幕上）
    const border = this.add.graphics();
    border.lineStyle(3, 0xffffff, 1);
    border.strokeRect(miniMapX - 2, miniMapY - 2, miniMapWidth + 4, miniMapHeight + 4);
    border.setScrollFactor(0);
    border.setDepth(1000);

    // 边框只在主相机显示
    this.miniMapCamera.ignore(border);

    // 添加小地图标签
    const label = this.add.text(miniMapX, miniMapY - 20, 'Mini Map', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 2 }
    });
    label.setScrollFactor(0);
    label.setDepth(1000);
    this.miniMapCamera.ignore(label);
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);

    // 处理键盘输入
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

    // 更新状态信号
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);
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