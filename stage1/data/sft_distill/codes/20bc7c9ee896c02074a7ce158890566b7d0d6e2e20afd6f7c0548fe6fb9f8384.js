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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillStar(0, 0, 5, 30, 60, 0); // 5个角，内半径30，外半径60
  
  // 生成纹理
  graphics.generateTexture('star', 120, 120);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建星形精灵
  const star = this.add.sprite(400, 300, 'star');
  
  // 设置为可交互和可拖拽
  star.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  star.on('dragstart', function(pointer, dragX, dragY) {
    // 放大到 1.2 倍
    this.setScale(1.2);
  });
  
  // 监听拖拽过程事件
  star.on('drag', function(pointer, dragX, dragY) {
    // 更新星形位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  star.on('dragend', function(pointer, dragX, dragY, dropped) {
    // 恢复原大小
    this.setScale(1.0);
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);