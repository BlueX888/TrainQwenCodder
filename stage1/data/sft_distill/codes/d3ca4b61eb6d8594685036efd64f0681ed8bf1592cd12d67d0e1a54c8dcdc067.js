const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 菱形计数器
  let diamondCount = 0;
  const maxDiamonds = 10;
  const diamondSize = 30; // 菱形半径

  // 创建定时器，每4秒触发一次
  this.time.addEvent({
    delay: 4000, // 4秒
    callback: () => {
      if (diamondCount < maxDiamonds) {
        // 生成随机位置（确保菱形完全在画布内）
        const x = Phaser.Math.Between(diamondSize, config.width - diamondSize);
        const y = Phaser.Math.Between(diamondSize, config.height - diamondSize);
        
        // 创建Graphics对象绘制菱形
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1); // 白色
        
        // 菱形的四个顶点坐标（相对于中心点）
        const points = [
          x, y - diamondSize,      // 上顶点
          x + diamondSize, y,      // 右顶点
          x, y + diamondSize,      // 下顶点
          x - diamondSize, y       // 左顶点
        ];
        
        // 绘制填充的多边形
        graphics.fillPoints(points, true);
        
        diamondCount++;
        
        console.log(`生成第 ${diamondCount} 个菱形，位置: (${x}, ${y})`);
      } else {
        console.log('已达到最大数量10个，停止生成');
      }
    },
    callbackScope: this,
    loop: true // 循环执行
  });
  
  // 添加提示文本
  this.add.text(10, 10, '每4秒生成一个白色菱形\n最多生成10个', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

new Phaser.Game(config);