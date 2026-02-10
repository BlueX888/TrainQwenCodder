// 完整的 Phaser3 代码 - 相机跟随移动的菱形
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.diamond = null;
    this.speed = 100; // 向下移动速度（像素/秒）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置世界边界，使其足够大以容纳移动
    this.physics.world.setBounds(0, 0, 800, 3000);
    
    // 创建菱形纹理
    this.createDiamondTexture();
    
    // 创建菱形精灵对象，放置在场景上方中央
    this.diamond = this.add.sprite(400, 300, 'diamond');
    
    // 设置相机边界与世界边界一致
    this.cameras.main.setBounds(0, 0, 800, 3000);
    
    // 让相机跟随菱形对象
    // 参数: 目标对象, roundPixels(是否取整像素), lerpX(水平插值), lerpY(垂直插值)
    this.cameras.main.startFollow(this.diamond, true, 0.1, 0.1);
    
    // 添加背景网格以便观察移动效果
    this.createBackgroundGrid();
    
    // 添加提示文本（固定在相机视图中）
    const text = this.add.text(10, 10, '相机跟随菱形向下移动', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setScrollFactor(0); // 固定在相机视图，不随世界滚动
  }

  update(time, delta) {
    // 让菱形持续向下移动
    // delta 是毫秒，需要转换为秒
    this.diamond.y += this.speed * (delta / 1000);
    
    // 当菱形移动到世界底部时，重置到顶部
    if (this.diamond.y > 2900) {
      this.diamond.y = 100;
    }
  }

  /**
   * 创建菱形纹理
   */
  createDiamondTexture() {
    const graphics = this.add.graphics();
    
    // 设置填充样式（蓝色菱形）
    graphics.fillStyle(0x3498db, 1);
    
    // 绘制菱形路径
    graphics.beginPath();
    graphics.moveTo(32, 0);    // 顶点
    graphics.lineTo(64, 32);   // 右顶点
    graphics.lineTo(32, 64);   // 底顶点
    graphics.lineTo(0, 32);    // 左顶点
    graphics.closePath();
    graphics.fillPath();
    
    // 添加白色边框
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokePath();
    
    // 生成纹理
    graphics.generateTexture('diamond', 64, 64);
    
    // 销毁 graphics 对象（纹理已生成）
    graphics.destroy();
  }

  /**
   * 创建背景网格以便观察相机移动
   */
  createBackgroundGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);
    
    // 绘制垂直线
    for (let x = 0; x <= 800; x += 100) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, 3000);
    }
    
    // 绘制水平线
    for (let y = 0; y <= 3000; y += 100) {
      graphics.moveTo(0, y);
      graphics.lineTo(800, y);
      
      // 每隔500像素添加标记文本
      if (y % 500 === 0) {
        this.add.text(10, y + 10, `Y: ${y}`, {
          fontSize: '16px',
          color: '#666666'
        });
      }
    }
    
    graphics.strokePath();
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
      gravity: { y: 0 },
      debug: false
    }
  }
};

// 创建游戏实例
new Phaser.Game(config);