const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建 48x48 的红色矩形
    // 使用 Rectangle GameObject，中心点对齐点击位置
    const rect = this.add.rectangle(
      pointer.x,      // x 坐标
      pointer.y,      // y 坐标
      48,             // 宽度
      48,             // 高度
      0xff0000        // 红色填充
    );
    
    // 可选：添加一些视觉反馈
    console.log(`矩形已创建于位置: (${pointer.x}, ${pointer.y})`);
  });
  
  // 添加提示文本
  this.add.text(10, 10, '点击画布任意位置生成红色矩形', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);