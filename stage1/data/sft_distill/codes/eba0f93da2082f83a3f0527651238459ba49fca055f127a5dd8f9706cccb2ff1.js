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

let diamond;
const MOVE_SPEED = 2; // 移动速度

function preload() {
  // 使用 Graphics 创建菱形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制菱形
  graphics.fillStyle(0xff6b6b, 1);
  graphics.beginPath();
  graphics.moveTo(32, 0);    // 上顶点
  graphics.lineTo(64, 32);   // 右顶点
  graphics.lineTo(32, 64);   // 下顶点
  graphics.lineTo(0, 32);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建菱形精灵，初始位置在场景中心
  diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置相机跟随菱形对象
  // 第二个参数 true 表示圆形跟随（平滑），false 表示锁定跟随
  // 第三个参数是水平跟随的平滑度 (0-1)，第四个参数是垂直跟随的平滑度
  this.cameras.main.startFollow(diamond, true, 0.1, 0.1);
  
  // 可选：设置相机边界，让场景更大
  // 这样可以看到相机跟随的效果
  this.cameras.main.setBounds(0, 0, 2000, 2000);
  
  // 添加一些参考网格，方便观察相机移动
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制网格
  for (let x = 0; x <= 2000; x += 100) {
    graphics.moveTo(x, 0);
    graphics.lineTo(x, 2000);
  }
  for (let y = 0; y <= 2000; y += 100) {
    graphics.moveTo(0, y);
    graphics.lineTo(2000, y);
  }
  graphics.strokePath();
  
  // 添加说明文字（固定在相机上）
  const text = this.add.text(10, 10, '菱形自动向右下移动\n相机跟随并保持居中', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随场景滚动
}

function update(time, delta) {
  // 让菱形自动向右下移动
  diamond.x += MOVE_SPEED;
  diamond.y += MOVE_SPEED;
  
  // 可选：添加旋转效果，让移动更明显
  diamond.rotation += 0.02;
  
  // 可选：限制移动范围，避免超出场景边界
  if (diamond.x > 1900 || diamond.y > 1900) {
    // 重置到起始位置
    diamond.setPosition(100, 100);
  }
}

// 创建游戏实例
new Phaser.Game(config);