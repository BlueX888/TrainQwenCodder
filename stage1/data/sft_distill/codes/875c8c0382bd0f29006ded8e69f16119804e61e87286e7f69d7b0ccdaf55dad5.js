const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 生成六边形纹理
  createHexagonTexture.call(this);
  
  // 计数器
  this.hexagonCount = 0;
  const maxHexagons = 10;
  
  // 创建定时器事件，每0.5秒触发一次
  this.timerEvent = this.time.addEvent({
    delay: 500,                    // 0.5秒 = 500毫秒
    callback: spawnHexagon,        // 回调函数
    callbackScope: this,           // 回调作用域
    loop: true                     // 循环执行
  });
  
  // 生成六边形的函数
  function spawnHexagon() {
    if (this.hexagonCount >= maxHexagons) {
      // 达到最大数量，移除定时器
      this.timerEvent.remove();
      return;
    }
    
    // 随机位置（留出边距避免六边形超出屏幕）
    const margin = 40;
    const x = Phaser.Math.Between(margin, this.game.config.width - margin);
    const y = Phaser.Math.Between(margin, this.game.config.height - margin);
    
    // 创建六边形精灵
    const hexagon = this.add.image(x, y, 'hexagon');
    
    // 添加淡入效果
    hexagon.setAlpha(0);
    this.tweens.add({
      targets: hexagon,
      alpha: 1,
      duration: 200,
      ease: 'Power2'
    });
    
    // 增加计数
    this.hexagonCount++;
    
    // 在控制台输出进度
    console.log(`生成第 ${this.hexagonCount} 个六边形，位置: (${x}, ${y})`);
  }
}

// 创建六边形纹理的辅助函数
function createHexagonTexture() {
  const graphics = this.add.graphics();
  
  // 六边形参数
  const size = 30;  // 六边形大小
  const points = [];
  
  // 计算六边形的6个顶点（以中心为原点）
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角度60度
    const x = size + Math.cos(angle) * size;
    const y = size + Math.sin(angle) * size;
    points.push(x, y);
  }
  
  // 绘制青色六边形
  graphics.fillStyle(0x00ffff, 1);  // 青色 (cyan)
  graphics.fillPoints(points, true);
  
  // 添加描边使其更明显
  graphics.lineStyle(2, 0x00cccc, 1);
  graphics.strokePoints(points, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', size * 2, size * 2);
  
  // 销毁graphics对象（纹理已生成，不再需要）
  graphics.destroy();
}

// 启动游戏
new Phaser.Game(config);