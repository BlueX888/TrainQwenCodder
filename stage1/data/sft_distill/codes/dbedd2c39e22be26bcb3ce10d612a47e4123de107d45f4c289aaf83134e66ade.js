const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建青色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制星形路径
  const starPoints = [];
  const outerRadius = 20;
  const innerRadius = 10;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    starPoints.push(radius * Math.cos(angle) + 20);
    starPoints.push(radius * Math.sin(angle) + 20);
  }
  
  graphics.fillPoints(starPoints, true);
  graphics.generateTexture('star', 40, 40);
  graphics.destroy();
  
  // 计数器，记录已生成的星形数量
  let starCount = 0;
  const maxStars = 12;
  
  // 创建定时器事件，每2.5秒触发一次
  this.time.addEvent({
    delay: 2500, // 2.5秒 = 2500毫秒
    callback: () => {
      // 生成随机位置
      const x = Phaser.Math.Between(20, 780);
      const y = Phaser.Math.Between(20, 580);
      
      // 创建星形精灵
      const star = this.add.image(x, y, 'star');
      
      // 添加简单的缩放动画效果
      this.tweens.add({
        targets: star,
        scale: { from: 0, to: 1 },
        duration: 300,
        ease: 'Back.easeOut'
      });
      
      starCount++;
      console.log(`生成第 ${starCount} 个星形，位置: (${x}, ${y})`);
    },
    repeat: 11, // 重复11次，加上首次共12次
    callbackScope: this
  });
  
  // 添加提示文本
  this.add.text(10, 10, '每2.5秒生成一个青色星形\n最多生成12个', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

new Phaser.Game(config);