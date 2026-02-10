const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let diamond;
let camera;

function preload() {
  // 使用 Graphics 创建菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制菱形（四个三角形组成）
  graphics.fillStyle(0xff6b6b, 1);
  graphics.beginPath();
  graphics.moveTo(32, 0);    // 上顶点
  graphics.lineTo(64, 32);   // 右顶点
  graphics.lineTo(32, 64);   // 下顶点
  graphics.lineTo(0, 32);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边使菱形更明显
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建一个大的世界边界，让物体有足够的移动空间
  this.physics.world.setBounds(0, 0, 3000, 3000);
  
  // 创建菱形精灵，初始位置在世界中心
  diamond = this.physics.add.sprite(400, 300, 'diamond');
  
  // 设置菱形向右下方移动的速度
  diamond.setVelocity(150, 150);
  
  // 设置菱形在世界边界内碰撞反弹
  diamond.setCollideWorldBounds(true);
  diamond.setBounce(1, 1);
  
  // 获取主相机
  camera = this.cameras.main;
  
  // 设置相机边界与世界边界一致
  camera.setBounds(0, 0, 3000, 3000);
  
  // 相机跟随菱形，保持居中
  // 参数：目标对象, 是否圆滑跟随（默认false表示紧密跟随）, 跟随速度（1表示立即跟随）
  camera.startFollow(diamond, true, 0.1, 0.1);
  
  // 可选：设置相机缩放以获得更好的视野
  // camera.setZoom(1);
  
  // 添加网格背景以更好地观察相机移动
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制网格
  for (let x = 0; x <= 3000; x += 100) {
    graphics.lineTo(x, 0);
    graphics.lineTo(x, 3000);
    graphics.moveTo(x + 100, 0);
  }
  for (let y = 0; y <= 3000; y += 100) {
    graphics.moveTo(0, y);
    graphics.lineTo(3000, y);
  }
  graphics.strokePath();
  
  // 添加中心参考点（在菱形初始位置）
  const centerDot = this.add.graphics();
  centerDot.fillStyle(0x00ff00, 1);
  centerDot.fillCircle(400, 300, 5);
  
  // 添加说明文字（固定在相机上）
  const text = this.add.text(10, 10, '相机跟随菱形移动\n菱形会在世界边界反弹', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随相机移动
}

function update(time, delta) {
  // 可选：在这里添加额外的更新逻辑
  // 例如：根据输入改变菱形速度等
  
  // 显示当前菱形位置（用于调试）
  // console.log(`Diamond position: (${diamond.x.toFixed(0)}, ${diamond.y.toFixed(0)})`);
}

// 创建游戏实例
const game = new Phaser.Game(config);