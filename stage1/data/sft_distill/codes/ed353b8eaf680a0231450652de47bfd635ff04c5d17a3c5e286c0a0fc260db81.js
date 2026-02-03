const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let triangle;
let speed = 2; // 每帧移动的像素

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制一个指向右侧的三角形
  graphics.beginPath();
  graphics.moveTo(0, -20);    // 顶点
  graphics.lineTo(-15, 20);   // 左下角
  graphics.lineTo(15, 20);    // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTexture', 30, 40);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建三角形 Sprite，初始位置在场景中央
  triangle = this.add.sprite(400, 300, 'triangleTexture');
  
  // 设置相机跟随三角形
  // startFollow(target, roundPixels, lerpX, lerpY, offsetX, offsetY)
  // roundPixels: 是否四舍五入像素以避免抖动
  // lerpX/lerpY: 插值系数（0-1），值越小跟随越平滑
  this.cameras.main.startFollow(triangle, true, 0.1, 0.1);
  
  // 设置相机边界，使其可以跟随到更远的地方
  this.cameras.main.setBounds(0, 0, 5000, 600);
  
  // 添加一些参考物体来显示移动效果
  for (let i = 0; i < 50; i++) {
    const x = i * 100;
    const rect = this.add.graphics();
    rect.lineStyle(2, 0xffffff, 0.3);
    rect.strokeRect(x, 250, 50, 100);
  }
  
  // 添加提示文本（固定在相机上）
  const text = this.add.text(10, 10, '三角形自动向右移动，相机跟随', {
    fontSize: '16px',
    color: '#ffffff'
  });
  text.setScrollFactor(0); // 固定在相机上，不随场景滚动
}

function update(time, delta) {
  // 让三角形持续向右移动
  triangle.x += speed;
  
  // 可选：当三角形移动到很远时重置位置（演示用）
  if (triangle.x > 4500) {
    triangle.x = 400;
  }
}

// 创建游戏实例
new Phaser.Game(config);