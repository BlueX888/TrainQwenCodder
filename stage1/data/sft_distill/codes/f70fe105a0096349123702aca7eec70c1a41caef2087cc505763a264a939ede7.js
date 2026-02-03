const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let target;
let camera;

function preload() {
  // 使用 Graphics 创建圆形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0xff6b6b, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy();
}

function create() {
  // 设置世界边界，让场景更大以展示相机跟随效果
  this.physics.world.setBounds(0, 0, 3000, 3000);
  
  // 添加网格背景以便观察相机移动
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x00ff00, 0.3);
  
  // 绘制网格
  for (let x = 0; x <= 3000; x += 100) {
    graphics.lineBetween(x, 0, x, 3000);
  }
  for (let y = 0; y <= 3000; y += 100) {
    graphics.lineBetween(0, y, 3000, y);
  }
  
  // 添加坐标标记
  const style = { fontSize: '16px', fill: '#00ff00' };
  for (let x = 0; x <= 3000; x += 500) {
    for (let y = 0; y <= 3000; y += 500) {
      this.add.text(x + 10, y + 10, `(${x},${y})`, style);
    }
  }
  
  // 创建移动目标（圆形）
  target = this.add.sprite(400, 300, 'circle');
  
  // 添加速度属性
  target.velocityX = 2;
  target.velocityY = -1.5;
  
  // 获取主相机
  camera = this.cameras.main;
  
  // 设置相机边界（与世界边界一致）
  camera.setBounds(0, 0, 3000, 3000);
  
  // 让相机跟随目标，第二个参数为是否圆滑跟随
  camera.startFollow(target, true);
  
  // 可选：设置跟随的平滑度（lerp值，0-1之间，越小越平滑但延迟越大）
  camera.setLerp(0.1, 0.1);
  
  // 添加提示文本（固定在相机视图上）
  const instructions = this.add.text(10, 10, 
    '相机正在跟随红色圆形\n圆形向右上方移动', 
    { 
      fontSize: '20px', 
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }
  );
  instructions.setScrollFactor(0); // 固定在相机视图上，不随相机移动
}

function update(time, delta) {
  // 让目标持续向右上方移动
  target.x += target.velocityX;
  target.y += target.velocityY;
  
  // 可选：当目标到达边界时反弹
  if (target.x > 2950 || target.x < 50) {
    target.velocityX *= -1;
  }
  if (target.y > 2950 || target.y < 50) {
    target.velocityY *= -1;
  }
}

// 创建游戏实例
new Phaser.Game(config);