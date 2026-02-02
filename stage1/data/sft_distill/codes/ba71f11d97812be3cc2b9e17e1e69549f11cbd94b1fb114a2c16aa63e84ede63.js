// 完整的 Phaser3 代码
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { 
    preload, 
    create 
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 不需要预加载资源
}

function create() {
  // 在屏幕左下角创建文字
  const text = this.add.text(20, 580, 'Hello Phaser', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置原点为左下角 (0, 1)，使文字从左下角开始定位
  text.setOrigin(0, 1);
}

new Phaser.Game(config);