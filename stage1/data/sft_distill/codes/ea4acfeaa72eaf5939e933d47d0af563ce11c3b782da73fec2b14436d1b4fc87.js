class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.ellipse = null;
    this.moveSpeed = 100; // 每秒移动像素
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置世界边界，使其大于相机视图
    this.cameras.main.setBounds(0, 0, 2000, 2000);
    this.physics.world.setBounds(0, 0, 2000, 2000);

    // 使用 Graphics 绘制椭圆并生成纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色椭圆
    graphics.fillEllipse(40, 30, 80, 60); // 中心点(40,30)，宽80，高60
    graphics.generateTexture('ellipseTex', 80, 60);
    graphics.destroy(); // 生成纹理后销毁 graphics 对象

    // 创建椭圆精灵，初始位置在场景中心
    this.ellipse = this.add.sprite(400, 300, 'ellipseTex');

    // 设置相机跟随椭圆对象
    this.cameras.main.startFollow(this.ellipse, true, 0.1, 0.1);
    
    // 可选：设置相机跟随的偏移（这里保持居中，偏移为0）
    this.cameras.main.setFollowOffset(0, 0);

    // 添加背景网格以便观察移动效果
    this.createBackgroundGrid();
  }

  update(time, delta) {
    // 让椭圆向右上方移动
    // 右上方向：x增加，y减少（Phaser坐标系y轴向下为正）
    const deltaSeconds = delta / 1000;
    
    // 45度角移动（右上方）
    this.ellipse.x += this.moveSpeed * deltaSeconds * Math.cos(-Math.PI / 4);
    this.ellipse.y += this.moveSpeed * deltaSeconds * Math.sin(-Math.PI / 4);

    // 限制在世界边界内（可选，防止移出世界）
    this.ellipse.x = Phaser.Math.Clamp(this.ellipse.x, 0, 2000);
    this.ellipse.y = Phaser.Math.Clamp(this.ellipse.y, 0, 2000);
  }

  createBackgroundGrid() {
    // 创建网格背景以便观察相机跟随效果
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x333333, 0.5);

    // 绘制垂直线
    for (let x = 0; x <= 2000; x += 100) {
      gridGraphics.lineBetween(x, 0, x, 2000);
    }

    // 绘制水平线
    for (let y = 0; y <= 2000; y += 100) {
      gridGraphics.lineBetween(0, y, 2000, y);
    }

    // 添加一些参考点
    const pointGraphics = this.add.graphics();
    pointGraphics.fillStyle(0xff0000, 1);
    for (let x = 0; x <= 2000; x += 200) {
      for (let y = 0; y <= 2000; y += 200) {
        pointGraphics.fillCircle(x, y, 3);
      }
    }
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

// 创建游戏实例
new Phaser.Game(config);