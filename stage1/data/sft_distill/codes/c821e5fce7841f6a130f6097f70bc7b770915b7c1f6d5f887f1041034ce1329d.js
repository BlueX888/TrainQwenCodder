const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 生成黄色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1);
  graphics.fillRect(0, 0, 80, 80);
  graphics.generateTexture('yellowBox', 80, 80);
  graphics.destroy();
}

function create() {
  // 创建黄色方块精灵
  const box = this.add.sprite(400, 300, 'yellowBox');
  
  // 创建抖动动画
  // 使用多个关键帧在 3 秒内快速改变位置，形成抖动效果
  this.tweens.add({
    targets: box,
    duration: 3000,
    ease: 'Linear',
    repeat: -1, // 无限循环
    yoyo: false,
    // 使用 x 和 y 的随机偏移来创建抖动效果
    props: {
      x: {
        value: '+=0', // 基准位置
        duration: 3000,
        ease: (t) => {
          // 自定义缓动函数：在 0-1 之间产生随机抖动
          // 使用正弦波叠加随机值创建抖动效果
          const shake = Math.sin(t * 50) * 5 + (Math.random() - 0.5) * 10;
          return shake / 400; // 归一化偏移量
        }
      },
      y: {
        value: '+=0',
        duration: 3000,
        ease: (t) => {
          const shake = Math.cos(t * 50) * 5 + (Math.random() - 0.5) * 10;
          return shake / 300;
        }
      }
    }
  });
  
  // 另一种更简单的实现方式：使用时间轴快速切换位置
  // 注释掉上面的 tween，使用下面这种方式也可以
  /*
  const timeline = this.tweens.timeline({
    loop: -1,
    targets: box
  });
  
  // 在 3 秒内添加多个快速抖动关键帧
  const shakeCount = 30; // 抖动次数
  const duration = 3000 / shakeCount; // 每次抖动持续时间
  
  for (let i = 0; i < shakeCount; i++) {
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;
    
    timeline.add({
      x: 400 + offsetX,
      y: 300 + offsetY,
      duration: duration,
      ease: 'Linear'
    });
  }
  
  // 最后回到原始位置
  timeline.add({
    x: 400,
    y: 300,
    duration: duration,
    ease: 'Linear'
  });
  
  timeline.play();
  */
  
  // 添加说明文字
  const text = this.add.text(400, 500, '黄色方块抖动动画（3秒循环）', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);