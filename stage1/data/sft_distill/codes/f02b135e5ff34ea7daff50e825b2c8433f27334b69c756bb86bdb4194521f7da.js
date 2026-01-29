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
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 六边形参数
  const hexRadius = 80;
  const centerX = 100;
  const centerY = 100;
  
  // 绘制填充六边形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  
  // 计算六边形的6个顶点（从顶部开始，顺时针）
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // -90度起始，使一个顶点朝上
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边
  graphics.lineStyle(4, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 200, 200);
  graphics.destroy(); // 销毁 Graphics 对象，因为已经生成纹理
  
  // 在场景中心创建六边形精灵
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 创建缩放动画
  this.tweens.add({
    targets: hexagon,
    scaleX: 0.32,
    scaleY: 0.32,
    duration: 3000, // 3秒
    ease: 'Sine.easeInOut', // 平滑的缓动效果
    yoyo: true, // 动画结束后反向播放（恢复到原始大小）
    loop: -1, // 无限循环 (-1 表示永久循环)
    onLoop: function() {
      // 每次循环时的回调（可选）
      console.log('Animation loop completed');
    }
  });
  
  // 添加提示文本
  const text = this.add.text(400, 550, 'Hexagon scaling to 32% and back (3s cycle)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
}

// 创建游戏实例
new Phaser.Game(config);