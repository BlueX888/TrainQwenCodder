class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.star = null;
    this.speed = 100; // 每秒移动像素
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 设置世界边界，让星形有足够的移动空间
    this.cameras.main.setBounds(0, 0, 800, 3000);
    this.physics.world.setBounds(0, 0, 800, 3000);

    // 创建星形图形
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色星形
    graphics.lineStyle(2, 0xff6600, 1); // 橙色边框

    // 绘制星形（5个角）
    const points = [];
    const centerX = 0;
    const centerY = 0;
    const outerRadius = 30;
    const innerRadius = 15;
    const numPoints = 5;

    for (let i = 0; i < numPoints * 2; i++) {
      const angle = (i * Math.PI) / numPoints - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    }

    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();

    // 生成纹理
    graphics.generateTexture('starTexture', 60, 60);
    graphics.destroy();

    // 创建星形精灵并启用物理
    this.star = this.physics.add.sprite(400, 2800, 'starTexture');
    this.star.setCollideWorldBounds(true);

    // 设置相机跟随星形
    this.cameras.main.startFollow(this.star, true, 0.1, 0.1);
    
    // 可选：设置相机跟随偏移，让星形显示在屏幕中心稍下方
    // this.cameras.main.setFollowOffset(0, 0);

    // 添加提示文本（固定在相机上）
    const instructionText = this.add.text(10, 10, 'Star moving up\nCamera following', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    instructionText.setScrollFactor(0); // 固定在相机视口上

    // 添加位置信息文本
    this.positionText = this.add.text(10, 80, '', {
      fontSize: '14px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.positionText.setScrollFactor(0);
  }

  update(time, delta) {
    if (this.star) {
      // 让星形向上移动（Y坐标减小）
      this.star.y -= (this.speed * delta) / 1000;

      // 如果到达世界顶部，重置到底部
      if (this.star.y < 30) {
        this.star.y = 2970;
      }

      // 更新位置信息
      this.positionText.setText(
        `Star Y: ${Math.round(this.star.y)}\n` +
        `Camera Y: ${Math.round(this.cameras.main.scrollY)}`
      );
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);