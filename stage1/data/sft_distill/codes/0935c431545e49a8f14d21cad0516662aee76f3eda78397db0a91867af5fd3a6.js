class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 场景尺寸
    const WORLD_WIDTH = 1600;
    const WORLD_HEIGHT = 1200;

    // 绘制场景背景 - 使用网格标识场景范围
    const graphics = this.add.graphics();
    
    // 绘制浅灰色背景
    graphics.fillStyle(0xf0f0f0, 1);
    graphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // 绘制网格线
    graphics.lineStyle(1, 0xcccccc, 0.5);
    const gridSize = 100;
    
    // 垂直线
    for (let x = 0; x <= WORLD_WIDTH; x += gridSize) {
      graphics.lineBetween(x, 0, x, WORLD_HEIGHT);
    }
    
    // 水平线
    for (let y = 0; y <= WORLD_HEIGHT; y += gridSize) {
      graphics.lineBetween(0, y, WORLD_WIDTH, y);
    }

    // 绘制场景边界（红色边框）
    graphics.lineStyle(4, 0xff0000, 1);
    graphics.strokeRect(2, 2, WORLD_WIDTH - 4, WORLD_HEIGHT - 4);

    // 在四个角落添加标记
    const cornerSize = 50;
    graphics.fillStyle(0xff0000, 0.8);
    
    // 左上角
    graphics.fillRect(10, 10, cornerSize, cornerSize);
    
    // 右上角
    graphics.fillRect(WORLD_WIDTH - cornerSize - 10, 10, cornerSize, cornerSize);
    
    // 左下角
    graphics.fillRect(10, WORLD_HEIGHT - cornerSize - 10, cornerSize, cornerSize);
    
    // 右下角
    graphics.fillRect(WORLD_WIDTH - cornerSize - 10, WORLD_HEIGHT - cornerSize - 10, cornerSize, cornerSize);

    // 添加中心标记
    graphics.fillStyle(0x0000ff, 0.8);
    graphics.fillCircle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 30);

    // 添加坐标文本标记（使用Graphics绘制简单的坐标指示）
    const textGraphics = this.add.graphics();
    textGraphics.fillStyle(0x000000, 1);
    
    // 左上角坐标标记
    textGraphics.fillRect(15, 70, 5, 20);
    textGraphics.fillRect(25, 70, 5, 20);
    
    // 右下角坐标标记
    textGraphics.fillRect(WORLD_WIDTH - 35, WORLD_HEIGHT - 90, 5, 20);
    textGraphics.fillRect(WORLD_WIDTH - 25, WORLD_HEIGHT - 90, 5, 20);

    // **核心：设置相机边界**
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // 创建一个可移动的玩家对象（用于演示相机跟随）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(0, 0, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    this.player = this.add.sprite(400, 300, 'player');
    this.player.setDepth(10);

    // 相机跟随玩家
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加信息文本（固定在屏幕上）
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#000000',
      backgroundColor: '#ffffff',
      padding: { x: 10, y: 5 }
    });
    this.infoText.setScrollFactor(0); // 固定在相机视口
    this.infoText.setDepth(100);

    // 添加说明文本
    this.helpText = this.add.text(10, 550, 
      '方向键: 移动玩家\n相机会跟随玩家但受边界限制', {
      fontSize: '14px',
      color: '#333333',
      backgroundColor: '#ffffff',
      padding: { x: 8, y: 4 }
    });
    this.helpText.setScrollFactor(0);
    this.helpText.setDepth(100);

    console.log('相机边界已设置:', this.cameras.main.getBounds());
  }

  update(time, delta) {
    const speed = 300;

    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.x -= speed * delta / 1000;
    } else if (this.cursors.right.isDown) {
      this.player.x += speed * delta / 1000;
    }

    if (this.cursors.up.isDown) {
      this.player.y -= speed * delta / 1000;
    } else if (this.cursors.down.isDown) {
      this.player.y += speed * delta / 1000;
    }

    // 限制玩家在场景内
    this.player.x = Phaser.Math.Clamp(this.player.x, 0, 1600);
    this.player.y = Phaser.Math.Clamp(this.player.y, 0, 1200);

    // 更新信息显示
    const cam = this.cameras.main;
    this.infoText.setText([
      `相机位置: (${Math.round(cam.scrollX)}, ${Math.round(cam.scrollY)})`,
      `玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `相机边界: 0,0 -> 1600,1200`,
      `视口大小: 800x600`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  scene: GameScene,
  pixelArt: false
};

new Phaser.Game(config);