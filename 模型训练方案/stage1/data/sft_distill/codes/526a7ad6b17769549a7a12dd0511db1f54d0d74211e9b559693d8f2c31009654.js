const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 星形计数器
  this.starCount = 0;
  const maxStars = 15;
  
  // 使用Graphics绘制青色星形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillStar(30, 30, 5, 15, 30, 0); // 中心(30,30), 5个角, 内径15, 外径30
  graphics.generateTexture('starTexture', 60, 60);
  graphics.destroy(); // 生成纹理后销毁graphics对象
  
  // 创建定时器事件，每4秒执行一次
  this.timerEvent = this.time.addEvent({
    delay: 4000, // 4秒
    callback: () => {
      // 生成随机位置
      const x = Phaser.Math.Between(30, 770);
      const y = Phaser.Math.Between(30, 570);
      
      // 创建星形图像
      const star = this.add.image(x, y, 'starTexture');
      
      // 增加计数
      this.starCount++;
      
      // 达到15个后移除定时器
      if (this.starCount >= maxStars) {
        this.timerEvent.remove();
        console.log('已生成15个星形，停止生成');
      }
    },
    callbackScope: this,
    loop: true // 循环执行
  });
  
  // 添加文本提示
  this.add.text(10, 10, '每4秒生成一个青色星形（最多15个）', {
    fontSize: '16px',
    color: '#ffffff'
  });
  
  // 显示当前星形数量
  this.countText = this.add.text(10, 35, '星形数量: 0 / 15', {
    fontSize: '16px',
    color: '#00ffff'
  });
  
  // 更新计数显示
  this.time.addEvent({
    delay: 100,
    callback: () => {
      this.countText.setText(`星形数量: ${this.starCount} / 15`);
    },
    callbackScope: this,
    loop: true
  });
}

new Phaser.Game(config);