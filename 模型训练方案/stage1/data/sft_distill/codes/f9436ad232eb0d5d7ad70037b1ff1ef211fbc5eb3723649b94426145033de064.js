// 创建场景类
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // 本任务不需要预加载资源
  }

  create() {
    // 在左上角 (10, 10) 位置创建文本
    // 字体大小设置为 80px
    const text = this.add.text(10, 10, 'Hello Phaser', {
      fontSize: '80px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    // 设置文本原点为左上角（默认就是左上角，这里显式设置以确保）
    text.setOrigin(0, 0);
  }

  update(time, delta) {
    // 本任务不需要更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);