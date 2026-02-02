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
  // 记录已生成的三角形数量
  let triangleCount = 0;
  const maxTriangles = 15;
  
  // 添加文本显示当前三角形数量
  const countText = this.add.text(10, 10, `Triangles: ${triangleCount}/${maxTriangles}`, {
    fontSize: '20px',
    color: '#ffffff'
  });
  
  // 创建定时器事件，每 4 秒生成一个三角形
  const timerEvent = this.time.addEvent({
    delay: 4000, // 4 秒
    callback: () => {
      // 生成随机位置（确保三角形完全在画布内）
      const margin = 50; // 边距，防止三角形超出边界
      const x = Phaser.Math.Between(margin, config.width - margin);
      const y = Phaser.Math.Between(margin, config.height - margin);
      
      // 创建 Graphics 对象绘制蓝色三角形
      const graphics = this.add.graphics();
      graphics.fillStyle(0x0066ff, 1); // 蓝色
      
      // 绘制等边三角形（顶点朝上）
      const size = 40; // 三角形大小
      const height = size * Math.sqrt(3) / 2;
      
      graphics.fillTriangle(
        x, y - height * 2/3,           // 顶点
        x - size/2, y + height * 1/3,  // 左下角
        x + size/2, y + height * 1/3   // 右下角
      );
      
      // 增加计数
      triangleCount++;
      countText.setText(`Triangles: ${triangleCount}/${maxTriangles}`);
      
      // 添加简单的缩放动画效果
      graphics.setScale(0);
      this.tweens.add({
        targets: graphics,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Back.easeOut'
      });
      
      console.log(`生成第 ${triangleCount} 个三角形，位置: (${x}, ${y})`);
    },
    callbackScope: this,
    repeat: 14, // 重复 14 次，加上首次执行共 15 次
    startAt: 0  // 立即开始第一次
  });
  
  // 添加提示文本
  this.add.text(10, 40, '每 4 秒生成一个蓝色三角形', {
    fontSize: '16px',
    color: '#aaaaaa'
  });
  
  // 添加进度文本
  const progressText = this.add.text(10, config.height - 30, '', {
    fontSize: '14px',
    color: '#ffffff'
  });
  
  // 更新进度显示
  this.time.addEvent({
    delay: 100,
    callback: () => {
      if (triangleCount < maxTriangles) {
        const elapsed = timerEvent.getElapsed();
        const remaining = timerEvent.delay - elapsed;
        progressText.setText(`下一个三角形将在 ${(remaining / 1000).toFixed(1)} 秒后生成`);
      } else {
        progressText.setText('所有三角形已生成完毕！');
      }
    },
    loop: true
  });
}

new Phaser.Game(config);