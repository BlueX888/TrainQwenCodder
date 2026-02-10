class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.starCount = 0;
    this.maxStars = 8;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 创建青色星形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    
    // 绘制星形路径
    const points = [];
    const radius = 30;
    const innerRadius = 15;
    const spikes = 5;
    
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const r = i % 2 === 0 ? radius : innerRadius;
      points.push({
        x: 30 + Math.cos(angle) * r,
        y: 30 + Math.sin(angle) * r
      });
    }
    
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.closePath();
    graphics.fillPath();
    
    // 生成纹理
    graphics.generateTexture('star', 60, 60);
    graphics.destroy();

    // 创建定时器事件，每1.5秒生成一个星形
    this.timerEvent = this.time.addEvent({
      delay: 1500, // 1.5秒
      callback: this.spawnStar,
      callbackScope: this,
      repeat: this.maxStars - 1 // 重复7次，加上第一次共8次
    });
  }

  spawnStar() {
    if (this.starCount >= this.maxStars) {
      return;
    }

    // 生成随机位置（考虑星形大小，避免超出边界）
    const x = Phaser.Math.Between(30, 770);
    const y = Phaser.Math.Between(30, 570);

    // 创建星形精灵
    const star = this.add.sprite(x, y, 'star');
    
    // 添加简单的缩放动画效果
    this.tweens.add({
      targets: star,
      scale: { from: 0, to: 1 },
      duration: 300,
      ease: 'Back.easeOut'
    });

    this.starCount++;
    
    console.log(`生成第 ${this.starCount} 个星形，位置: (${x}, ${y})`);
  }

  update(time, delta) {
    // 无需每帧更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

new Phaser.Game(config);