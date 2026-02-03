// 全局状态信号
window.__signals__ = {
  playerX: 0,
  playerY: 0,
  mainCameraX: 0,
  mainCameraY: 0,
  miniMapActive: true,
  moveCount: 0,
  timestamp: 0
};

class MiniMapScene extends Phaser.Scene {
  constructor() {
    super('MiniMapScene');
    this.worldWidth = 1600;
    this.worldHeight = 1200;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建地图背景
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x2d5016, 1);
    bgGraphics.fillRect(0, 0, this.worldWidth, this.worldHeight);

    // 绘制地图边界
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(4, 0x8b4513, 1);
    borderGraphics.strokeRect(0, 0, this.worldWidth, this.worldHeight);

    // 绘制一些障碍物/地标
    const obstacleGraphics = this.add.graphics();
    obstacleGraphics.fillStyle(0x654321, 1);
    
    // 左上区域
    obstacleGraphics.fillRect(200, 200, 150, 150);
    obstacleGraphics.fillRect(500, 150, 100, 200);
    
    // 右上区域
    obstacleGraphics.fillRect(1200, 250, 200, 100);
    
    // 中间区域
    obstacleGraphics.fillRect(700, 500, 200, 150);
    obstacleGraphics.fillRect(400, 600, 150, 100);
    
    // 下方区域
    obstacleGraphics.fillRect(300, 950, 180, 120);
    obstacleGraphics.fillRect(1100, 900, 250, 150);

    // 绘制一些装饰点
    obstacleGraphics.fillStyle(0xffff00, 1);
    obstacleGraphics.fillCircle(800, 300, 30);
    obstacleGraphics.fillCircle(1300, 700, 25);
    obstacleGraphics.fillCircle(400, 850, 20);

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(800, 600, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setCircle(16);

    // 设置世界边界
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // 配置主相机
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);

    // 创建小地图相机
    const miniMapWidth = 200;
    const miniMapHeight = 150;
    const miniMapX = this.cameras.main.width - miniMapWidth - 10;
    const miniMapY = 10;

    this.miniMapCamera = this.cameras.add(
      miniMapX, 
      miniMapY, 
      miniMapWidth, 
      miniMapHeight
    );
    
    this.miniMapCamera.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.miniMapCamera.setZoom(miniMapWidth / this.worldWidth);
    this.miniMapCamera.setBackgroundColor(0x000000);

    // 小地图边框
    const miniMapBorder = this.add.graphics();
    miniMapBorder.lineStyle(3, 0xffffff, 1);
    miniMapBorder.strokeRect(
      miniMapX - 2, 
      miniMapY - 2, 
      miniMapWidth + 4, 
      miniMapHeight + 4
    );
    miniMapBorder.setScrollFactor(0);
    miniMapBorder.setDepth(1000);

    // 小地图标签
    const miniMapLabel = this.add.text(
      miniMapX + 5, 
      miniMapY + 5, 
      'MAP', 
      { 
        fontSize: '12px', 
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 4, y: 2 }
      }
    );
    miniMapLabel.setScrollFactor(0);
    miniMapLabel.setDepth(1001);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加坐标显示
    this.coordsText = this.add.text(10, 10, '', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 6, y: 4 }
    });
    this.coordsText.setScrollFactor(0);
    this.coordsText.setDepth(1000);

    // 初始化信号
    this.updateSignals();

    console.log('[MiniMap] Scene created - World:', this.worldWidth, 'x', this.worldHeight);
  }

  update(time, delta) {
    const speed = 120;
    
    // 重置速度
    this.player.setVelocity(0);

    // 键盘控制
    let moving = false;
    
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-speed);
      moving = true;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(speed);
      moving = true;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-speed);
      moving = true;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(speed);
      moving = true;
    }

    // 对角线移动速度归一化
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }

    // 更新坐标显示
    this.coordsText.setText(
      `Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
      `Camera: (${Math.round(this.cameras.main.scrollX)}, ${Math.round(this.cameras.main.scrollY)})\n` +
      `Moves: ${window.__signals__.moveCount}`
    );

    // 更新信号
    if (moving) {
      window.__signals__.moveCount++;
    }
    this.updateSignals();
  }

  updateSignals() {
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.mainCameraX = Math.round(this.cameras.main.scrollX);
    window.__signals__.mainCameraY = Math.round(this.cameras.main.scrollY);
    window.__signals__.miniMapActive = this.miniMapCamera.visible;
    window.__signals__.timestamp = Date.now();

    // 每100帧输出一次日志
    if (this.game.getFrame() % 100 === 0) {
      console.log('[Signal]', JSON.stringify(window.__signals__));
    }
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
  scene: MiniMapScene,
  seed: [(Date.now() * Math.random()).toString()]
};

const game = new Phaser.Game(config);

// 导出验证接口
window.__game__ = game;
window.__getPlayer__ = () => {
  const scene = game.scene.getScene('MiniMapScene');
  return scene ? scene.player : null;
};
window.__getCameras__ = () => {
  const scene = game.scene.getScene('MiniMapScene');
  return scene ? {
    main: scene.cameras.main,
    miniMap: scene.miniMapCamera
  } : null;
};

console.log('[Game] MiniMap game initialized');
console.log('[Controls] Use Arrow Keys or WASD to move player');
console.log('[Info] Main camera follows player, minimap shows full world view');