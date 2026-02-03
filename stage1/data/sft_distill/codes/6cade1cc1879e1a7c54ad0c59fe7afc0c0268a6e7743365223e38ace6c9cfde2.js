class MiniMapScene extends Phaser.Scene {
  constructor() {
    super('MiniMapScene');
    this.playerX = 0;
    this.playerY = 0;
    this.mapWidth = 1600;
    this.mapHeight = 1200;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建大地图背景
    this.createMap();
    
    // 创建玩家纹理和精灵
    this.createPlayer();
    
    // 设置主相机
    this.setupMainCamera();
    
    // 创建小地图相机
    this.createMiniMap();
    
    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加位置显示文本（用于验证）
    this.positionText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.positionText.setScrollFactor(0); // 固定在屏幕上
    this.positionText.setDepth(1000);
  }

  createMap() {
    const graphics = this.add.graphics();
    
    // 绘制地图背景（浅灰色）
    graphics.fillStyle(0x334455, 1);
    graphics.fillRect(0, 0, this.mapWidth, this.mapHeight);
    
    // 绘制网格线作为参考
    graphics.lineStyle(1, 0x445566, 0.5);
    for (let x = 0; x <= this.mapWidth; x += 200) {
      graphics.lineBetween(x, 0, x, this.mapHeight);
    }
    for (let y = 0; y <= this.mapHeight; y += 200) {
      graphics.lineBetween(0, y, this.mapWidth, y);
    }
    
    // 绘制地图边界（红色）
    graphics.lineStyle(4, 0xff0000, 1);
    graphics.strokeRect(0, 0, this.mapWidth, this.mapHeight);
    
    // 绘制一些参考物体（障碍物）
    graphics.fillStyle(0x228822, 1);
    graphics.fillCircle(400, 300, 50);
    graphics.fillCircle(1200, 400, 60);
    graphics.fillCircle(800, 800, 70);
    graphics.fillCircle(300, 900, 40);
    graphics.fillCircle(1400, 1000, 55);
    
    // 绘制中心标记
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(this.mapWidth / 2, this.mapHeight / 2, 30);
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeCircle(this.mapWidth / 2, this.mapHeight / 2, 30);
  }

  createPlayer() {
    // 使用 Graphics 创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00aaff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeCircle(16, 16, 16);
    
    // 添加方向指示器
    graphics.fillStyle(0xffffff, 1);
    graphics.fillTriangle(16, 4, 12, 12, 20, 12);
    
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
    
    // 创建玩家精灵，初始位置在地图中心
    this.player = this.physics.add.sprite(
      this.mapWidth / 2,
      this.mapHeight / 2,
      'player'
    );
    this.player.setCollideWorldBounds(true);
    
    // 设置玩家深度确保在其他物体上方
    this.player.setDepth(100);
  }

  setupMainCamera() {
    // 获取主相机
    this.mainCamera = this.cameras.main;
    
    // 设置相机边界为地图大小
    this.mainCamera.setBounds(0, 0, this.mapWidth, this.mapHeight);
    
    // 相机跟随玩家
    this.mainCamera.startFollow(this.player, true, 0.1, 0.1);
    
    // 设置相机背景色
    this.mainCamera.setBackgroundColor(0x000000);
  }

  createMiniMap() {
    // 计算小地图尺寸（屏幕的1/4）
    const miniMapWidth = 200;
    const miniMapHeight = 150;
    const padding = 10;
    
    // 创建小地图相机，位于右上角
    this.miniMapCamera = this.cameras.add(
      this.cameras.main.width - miniMapWidth - padding,
      padding,
      miniMapWidth,
      miniMapHeight
    );
    
    // 设置小地图相机边界
    this.miniMapCamera.setBounds(0, 0, this.mapWidth, this.mapHeight);
    
    // 计算缩放比例以显示整个地图
    const zoomX = miniMapWidth / this.mapWidth;
    const zoomY = miniMapHeight / this.mapHeight;
    const zoom = Math.min(zoomX, zoomY);
    this.miniMapCamera.setZoom(zoom);
    
    // 设置小地图背景和边框
    this.miniMapCamera.setBackgroundColor(0x222222);
    
    // 小地图居中显示整个世界
    this.miniMapCamera.centerOn(this.mapWidth / 2, this.mapHeight / 2);
    
    // 创建小地图边框
    const border = this.add.graphics();
    border.lineStyle(3, 0xffffff, 1);
    border.strokeRect(
      this.cameras.main.width - miniMapWidth - padding - 2,
      padding - 2,
      miniMapWidth + 4,
      miniMapHeight + 4
    );
    border.setScrollFactor(0);
    border.setDepth(999);
    
    // 添加小地图标签
    const label = this.add.text(
      this.cameras.main.width - miniMapWidth - padding,
      padding - 20,
      'Mini Map',
      {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 3, y: 2 }
      }
    );
    label.setScrollFactor(0);
    label.setDepth(999);
  }

  update(time, delta) {
    // 玩家移动控制
    const speed = 200;
    
    this.player.setVelocity(0);
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }
    
    // 归一化对角线速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }
    
    // 更新玩家旋转朝向移动方向
    if (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0) {
      this.player.rotation = Math.atan2(
        this.player.body.velocity.y,
        this.player.body.velocity.x
      ) + Math.PI / 2;
    }
    
    // 更新状态信号（用于验证）
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);
    
    // 更新位置显示
    this.positionText.setText(
      `Player Position: (${this.playerX}, ${this.playerY})\n` +
      `Map Size: ${this.mapWidth}x${this.mapHeight}\n` +
      `Use Arrow Keys to Move (Speed: ${speed})`
    );
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
  scene: MiniMapScene
};

// 创建游戏实例
const game = new Phaser.Game(config);