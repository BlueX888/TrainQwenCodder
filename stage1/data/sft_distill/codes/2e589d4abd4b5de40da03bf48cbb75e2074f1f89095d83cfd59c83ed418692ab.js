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

let player;
let moveSpeed = 2;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建一个参考网格背景，帮助观察相机移动
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x00ff00, 0.3);
  
  // 绘制网格线
  for (let x = -2000; x < 2000; x += 100) {
    graphics.lineBetween(x, -1000, x, 1000);
  }
  for (let y = -1000; y < 1000; y += 100) {
    graphics.lineBetween(-2000, y, 2000, y);
  }
  
  // 创建玩家矩形
  player = this.add.graphics();
  player.fillStyle(0xff0000, 1);
  player.fillRect(-25, -25, 50, 50); // 中心点在 (0, 0)
  
  // 设置玩家初始位置
  player.x = 400;
  player.y = 300;
  
  // 添加一些静态参考物体
  const ref1 = this.add.graphics();
  ref1.fillStyle(0x00ffff, 1);
  ref1.fillCircle(200, 300, 30);
  
  const ref2 = this.add.graphics();
  ref2.fillStyle(0xffff00, 1);
  ref2.fillCircle(600, 300, 30);
  
  const ref3 = this.add.graphics();
  ref3.fillStyle(0xff00ff, 1);
  ref3.fillCircle(0, 300, 30);
  
  const ref4 = this.add.graphics();
  ref4.fillStyle(0xffffff, 1);
  ref4.fillCircle(800, 300, 30);
  
  // 设置相机边界（可选，让相机可以无限跟随）
  this.cameras.main.setBounds(-2000, -1000, 4000, 2000);
  
  // 相机跟随玩家
  this.cameras.main.startFollow(player, true, 0.1, 0.1);
  
  // 设置跟随偏移量，使对象保持在屏幕中心
  // 偏移量为 (0, 0) 表示对象在相机中心
  this.cameras.main.setFollowOffset(0, 0);
  
  // 添加文本提示（固定在相机上）
  const text = this.add.text(10, 10, '红色矩形自动向左移动\n相机跟随并保持居中', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随场景滚动
}

function update(time, delta) {
  // 让玩家持续向左移动
  player.x -= moveSpeed;
  
  // 可选：添加边界限制
  // if (player.x < -1500) {
  //   player.x = -1500;
  // }
}

// 创建游戏实例
const game = new Phaser.Game(config);