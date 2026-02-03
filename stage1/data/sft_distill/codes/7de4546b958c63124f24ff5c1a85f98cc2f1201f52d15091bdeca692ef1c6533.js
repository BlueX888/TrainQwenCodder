const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillStar(50, 50, 5, 20, 40, 0); // 绘制五角星
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建星形精灵
  const star = this.add.sprite(400, 300, 'star');
  
  // 设置为可交互和可拖拽
  star.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  star.on('dragstart', (pointer, dragX, dragY) => {
    // 缩放到 1.2 倍
    star.setScale(1.2);
  });
  
  // 监听拖拽事件
  star.on('drag', (pointer, dragX, dragY) => {
    // 更新星形位置
    star.x = dragX;
    star.y = dragY;
  });
  
  // 监听拖拽结束事件
  star.on('dragend', (pointer, dragX, dragY) => {
    // 恢复原始大小
    star.setScale(1.0);
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);